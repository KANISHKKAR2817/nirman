package com.nirman.service;

import com.nirman.dto.TaskDto;
import com.nirman.entity.*;
import com.nirman.exception.BusinessValidationException;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import com.nirman.simulation.ScheduleDAG;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ConstructionZoneRepository zoneRepository;
    private final TaskDependencyRepository dependencyRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public List<TaskDto> getTasks(Long projectId, String status, Long zoneId) {
        List<Task> tasks;
        if (zoneId != null) {
            tasks = taskRepository.findByZoneId(zoneId);
        } else if (status != null && !status.isEmpty()) {
            tasks = taskRepository.findByProjectIdAndStatus(projectId, status);
        } else {
            tasks = taskRepository.findByProjectId(projectId);
        }

        // Calculate CPM for critical path and slack flags
        Map<Long, ScheduleDAG.Node> cpmMap = computeCpmMap(projectId);

        return tasks.stream()
                .map(t -> mapToDto(t, cpmMap.get(t.getId())))
                .collect(Collectors.toList());
    }

    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        Map<Long, ScheduleDAG.Node> cpmMap = computeCpmMap(task.getProject().getId());
        return mapToDto(task, cpmMap.get(task.getId()));
    }

    @Transactional
    public TaskDto createTask(Long projectId, TaskDto.CreateUpdateRequest request, String actor) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ConstructionZone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));
        }

        validateProgress(request.getProgressPercentage());

        Task task = Task.builder()
                .taskCode(request.getTaskCode())
                .name(request.getName())
                .description(request.getDescription())
                .project(project)
                .zone(zone)
                .assignedTeam(request.getAssignedTeam())
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .estimatedDurationDays(request.getEstimatedDurationDays() != null ? request.getEstimatedDurationDays() : 1)
                .progressPercentage(request.getProgressPercentage() != null ? request.getProgressPercentage() : BigDecimal.ZERO)
                .priority(request.getPriority() != null ? request.getPriority() : "MEDIUM")
                .status(request.getStatus() != null ? request.getStatus() : "NOT_STARTED")
                .estimatedCost(request.getEstimatedCost() != null ? request.getEstimatedCost() : BigDecimal.ZERO)
                .actualCost(request.getActualCost() != null ? request.getActualCost() : BigDecimal.ZERO)
                .weight(request.getWeight() != null ? request.getWeight() : BigDecimal.ONE)
                .overrideReason(request.getOverrideReason())
                .build();

        Task saved = taskRepository.save(task);

        if (request.getPrerequisiteTaskIds() != null) {
            for (Long prereqId : request.getPrerequisiteTaskIds()) {
                Task prereq = taskRepository.findById(prereqId).orElse(null);
                if (prereq != null) {
                    TaskDependency dep = TaskDependency.builder()
                            .task(saved)
                            .prerequisiteTask(prereq)
                            .dependencyType("FINISH_TO_START")
                            .build();
                    dependencyRepository.save(dep);
                }
            }
        }

        recalculateProjectProgress(project);
        auditLogService.record(projectId, actor, "CREATE_TASK", "TASK", saved.getId(),
                "Created task: " + saved.getTaskCode() + " - " + saved.getName(), null);

        Map<Long, ScheduleDAG.Node> cpmMap = computeCpmMap(projectId);
        return mapToDto(saved, cpmMap.get(saved.getId()));
    }

    @Transactional
    public TaskDto updateProgress(Long taskId, TaskDto.ProgressUpdateRequest request, String actor) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        BigDecimal progress = request.getProgressPercentage();
        validateProgress(progress);

        String targetStatus = request.getStatus();

        // Section 7 Requirement: "A completed task must have 100% progress."
        if ("COMPLETED".equalsIgnoreCase(targetStatus) && progress.compareTo(BigDecimal.valueOf(100.00)) < 0) {
            progress = BigDecimal.valueOf(100.00);
        } else if (progress.compareTo(BigDecimal.valueOf(100.00)) == 0 && targetStatus == null) {
            targetStatus = "COMPLETED";
        }

        // Section 7 Requirement: "Prevent a task from being marked complete while required dependencies remain incomplete unless an authorized user explicitly overrides with a recorded reason."
        if ("COMPLETED".equalsIgnoreCase(targetStatus) || progress.compareTo(BigDecimal.valueOf(100.00)) == 0) {
            List<TaskDependency> dependencies = dependencyRepository.findByTaskId(taskId);
            List<String> incompletePrereqs = dependencies.stream()
                    .map(TaskDependency::getPrerequisiteTask)
                    .filter(p -> !"COMPLETED".equalsIgnoreCase(p.getStatus()))
                    .map(Task::getTaskCode)
                    .collect(Collectors.toList());

            if (!incompletePrereqs.isEmpty()) {
                if (request.getOverrideReason() == null || request.getOverrideReason().trim().isEmpty()) {
                    throw new BusinessValidationException(String.format(
                            "Cannot complete task %s: Prerequisite tasks %s are not completed. Explicit override reason is required.",
                            task.getTaskCode(), incompletePrereqs
                    ));
                }
                task.setOverrideReason(request.getOverrideReason());
            }
            task.setActualCompletionDate(LocalDate.now());
        }

        task.setProgressPercentage(progress);
        if (targetStatus != null && !targetStatus.isEmpty()) {
            task.setStatus(targetStatus);
        } else if (progress.compareTo(BigDecimal.ZERO) > 0 && progress.compareTo(BigDecimal.valueOf(100.00)) < 0) {
            if ("NOT_STARTED".equalsIgnoreCase(task.getStatus())) {
                task.setStatus("IN_PROGRESS");
            }
        }

        Task updated = taskRepository.save(task);
        recalculateProjectProgress(task.getProject());

        // Notify if task becomes overdue
        if ("OVERDUE".equalsIgnoreCase(updated.getStatus())) {
            notificationService.createNotification(
                    task.getProject().getId(),
                    "Task Overdue: " + task.getTaskCode(),
                    "Task " + task.getName() + " missed its due date (" + task.getDueDate() + ").",
                    "CRITICAL", "TASK", "TASK", task.getId()
            );
        }

        auditLogService.record(task.getProject().getId(), actor, "UPDATE_TASK_PROGRESS", "TASK", task.getId(),
                String.format("Updated %s progress to %.1f%%, status: %s", task.getTaskCode(), progress, task.getStatus()), null);

        Map<Long, ScheduleDAG.Node> cpmMap = computeCpmMap(task.getProject().getId());
        return mapToDto(updated, cpmMap.get(updated.getId()));
    }

    /**
     * Section 7 Progress Calculation Method:
     * Calculates overall project progress using task weights:
     * Overall Progress = Sum of (Task Progress % * Task Weight) / Sum of (Task Weights)
     */
    @Transactional
    public void recalculateProjectProgress(Project project) {
        List<Task> tasks = taskRepository.findByProjectId(project.getId());
        if (tasks.isEmpty()) {
            project.setProgressPercentage(BigDecimal.ZERO);
            projectRepository.save(project);
            return;
        }

        BigDecimal totalWeightedProgress = BigDecimal.ZERO;
        BigDecimal totalWeight = BigDecimal.ZERO;

        for (Task t : tasks) {
            BigDecimal weight = (t.getWeight() != null && t.getWeight().compareTo(BigDecimal.ZERO) > 0)
                    ? t.getWeight()
                    : BigDecimal.valueOf(t.getEstimatedDurationDays()); // duration fallback
            totalWeight = totalWeight.add(weight);
            BigDecimal weightedPart = t.getProgressPercentage().multiply(weight);
            totalWeightedProgress = totalWeightedProgress.add(weightedPart);
        }

        BigDecimal overall = totalWeight.compareTo(BigDecimal.ZERO) > 0
                ? totalWeightedProgress.divide(totalWeight, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        project.setProgressPercentage(overall);
        projectRepository.save(project);
    }

    private void validateProgress(BigDecimal progress) {
        if (progress == null || progress.compareTo(BigDecimal.ZERO) < 0 || progress.compareTo(BigDecimal.valueOf(100.00)) > 0) {
            throw new BusinessValidationException("Task progress must be between 0.00% and 100.00%");
        }
    }

    private Map<Long, ScheduleDAG.Node> computeCpmMap(Long projectId) {
        try {
            List<Task> tasks = taskRepository.findByProjectId(projectId);
            List<TaskDependency> deps = dependencyRepository.findAll();
            ScheduleDAG dag = new ScheduleDAG();
            for (Task t : tasks) {
                dag.addNode(t.getId(), t.getTaskCode(), t.getName(), t.getEstimatedDurationDays());
            }
            for (TaskDependency d : deps) {
                dag.addDependency(d.getPrerequisiteTask().getId(), d.getTask().getId());
            }
            List<ScheduleDAG.Node> cpmNodes = dag.calculateCPM();
            return cpmNodes.stream().collect(Collectors.toMap(ScheduleDAG.Node::getTaskId, n -> n));
        } catch (Exception e) {
            log.warn("CPM calculation skipped: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    private TaskDto mapToDto(Task t, ScheduleDAG.Node cpmNode) {
        List<TaskDependency> deps = dependencyRepository.findByTaskId(t.getId());
        List<Long> prereqIds = deps.stream().map(d -> d.getPrerequisiteTask().getId()).collect(Collectors.toList());
        List<String> prereqCodes = deps.stream().map(d -> d.getPrerequisiteTask().getTaskCode()).collect(Collectors.toList());

        return TaskDto.builder()
                .id(t.getId())
                .taskCode(t.getTaskCode())
                .name(t.getName())
                .description(t.getDescription())
                .projectId(t.getProject().getId())
                .zoneId(t.getZone() != null ? t.getZone().getId() : null)
                .zoneName(t.getZone() != null ? t.getZone().getName() : "Unassigned Zone")
                .assignedTeam(t.getAssignedTeam())
                .startDate(t.getStartDate())
                .dueDate(t.getDueDate())
                .actualCompletionDate(t.getActualCompletionDate())
                .estimatedDurationDays(t.getEstimatedDurationDays())
                .progressPercentage(t.getProgressPercentage())
                .priority(t.getPriority())
                .status(t.getStatus())
                .estimatedCost(t.getEstimatedCost())
                .actualCost(t.getActualCost())
                .weight(t.getWeight())
                .overrideReason(t.getOverrideReason())
                .prerequisiteTaskIds(prereqIds)
                .prerequisiteTaskCodes(prereqCodes)
                .isCriticalPath(cpmNode != null && cpmNode.isCritical())
                .slackDays(cpmNode != null ? cpmNode.getTotalSlack() : 0)
                .build();
    }
}
