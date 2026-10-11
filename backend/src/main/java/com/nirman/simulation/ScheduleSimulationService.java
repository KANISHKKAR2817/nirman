package com.nirman.simulation;

import com.nirman.dto.SimulationDto;
import com.nirman.entity.*;
import com.nirman.exception.BusinessValidationException;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ScheduleSimulationService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TaskDependencyRepository dependencyRepository;
    private final SimulationScenarioRepository scenarioRepository;
    private final SimulationScenarioChangeRepository scenarioChangeRepository;

    public SimulationDto.SimulationResult runWhatIfSimulation(SimulationDto.RunRequest request) {
        Long projectId = request.getProjectId();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Task> originalTasks = taskRepository.findByProjectId(projectId);
        List<TaskDependency> dependencies = dependencyRepository.findAll();

        // 1. Build Baseline DAG
        ScheduleDAG baselineDag = new ScheduleDAG();
        for (Task t : originalTasks) {
            baselineDag.addNode(t.getId(), t.getTaskCode(), t.getName(), t.getEstimatedDurationDays());
        }
        for (TaskDependency dep : dependencies) {
            if (baselineDag.getProjectDurationDays() >= 0) {
                baselineDag.addDependency(dep.getPrerequisiteTask().getId(), dep.getTask().getId());
            }
        }

        if (baselineDag.hasCycle()) {
            throw new BusinessValidationException("Dependency cycle detected in baseline schedule");
        }
        List<ScheduleDAG.Node> baselineCpm = baselineDag.calculateCPM();
        int baselineDurationDays = baselineDag.getProjectDurationDays();

        // 2. Build Simulated DAG with isolated modifications (Does NOT mutate baseline)
        ScheduleDAG simulatedDag = new ScheduleDAG();
        Map<Long, Integer> simulatedDurations = new HashMap<>();
        Map<Long, BigDecimal> simulatedCosts = new HashMap<>();

        for (Task t : originalTasks) {
            simulatedDurations.put(t.getId(), t.getEstimatedDurationDays());
            simulatedCosts.put(t.getId(), t.getEstimatedCost());
        }

        // Apply parameter changes to simulation copy
        if (request.getChanges() != null) {
            for (SimulationDto.ParameterChange change : request.getChanges()) {
                Long taskId = change.getTaskId();
                if (simulatedDurations.containsKey(taskId)) {
                    if ("DURATION_DAYS".equalsIgnoreCase(change.getParameterName())) {
                        int newDur = Integer.parseInt(change.getSimulatedValue());
                        simulatedDurations.put(taskId, Math.max(1, newDur));
                    } else if ("WORKERS_ADDED".equalsIgnoreCase(change.getParameterName())) {
                        // Adding workers reduces duration by ~25% and adds 10% labor cost
                        int extraWorkers = Integer.parseInt(change.getSimulatedValue());
                        int currDur = simulatedDurations.get(taskId);
                        int reducedDur = Math.max(2, (int) Math.round(currDur / (1.0 + (extraWorkers * 0.25))));
                        simulatedDurations.put(taskId, reducedDur);
                        simulatedCosts.put(taskId, simulatedCosts.get(taskId).multiply(BigDecimal.valueOf(1.0 + (extraWorkers * 0.10))));
                    }
                }
            }
        }

        for (Task t : originalTasks) {
            simulatedDag.addNode(t.getId(), t.getTaskCode(), t.getName(), simulatedDurations.get(t.getId()));
        }
        for (TaskDependency dep : dependencies) {
            simulatedDag.addDependency(dep.getPrerequisiteTask().getId(), dep.getTask().getId());
        }

        if (simulatedDag.hasCycle()) {
            throw new BusinessValidationException("Simulated schedule changes introduced a circular dependency");
        }
        List<ScheduleDAG.Node> simulatedCpm = simulatedDag.calculateCPM();
        int simulatedDurationDays = simulatedDag.getProjectDurationDays();

        // Calculate deltas
        int delayDays = simulatedDurationDays - baselineDurationDays;
        LocalDate baselineEndDate = project.getPlannedCompletionDate();
        LocalDate projectedEndDate = baselineEndDate.plusDays(delayDays);

        BigDecimal baselineCost = originalTasks.stream()
                .map(Task::getEstimatedCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal projectedCost = simulatedCosts.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal costDelta = projectedCost.subtract(baselineCost);

        // Risk impact: delay increases risk, acceleration reduces risk
        BigDecimal baselineRiskScore = BigDecimal.valueOf(68.30);
        double riskAdjust = delayDays * 2.5;
        BigDecimal projectedRiskScore = baselineRiskScore.add(BigDecimal.valueOf(riskAdjust))
                .max(BigDecimal.valueOf(10.0))
                .min(BigDecimal.valueOf(98.0))
                .setScale(2, RoundingMode.HALF_UP);

        // Convert critical path nodes
        List<SimulationDto.CriticalPathNode> criticalPathNodes = simulatedCpm.stream()
                .map(n -> SimulationDto.CriticalPathNode.builder()
                        .taskId(n.getTaskId())
                        .taskCode(n.getTaskCode())
                        .taskName(n.getTaskName())
                        .durationDays(n.getDuration())
                        .earlyStartDay(n.getEarlyStart())
                        .earlyFinishDay(n.getEarlyFinish())
                        .lateStartDay(n.getLateStart())
                        .lateFinishDay(n.getLateFinish())
                        .slackDays(n.getTotalSlack())
                        .isCritical(n.isCritical())
                        .build())
                .collect(Collectors.toList());

        // Comparison items
        List<SimulationDto.TaskComparison> comparisons = originalTasks.stream()
                .map(t -> {
                    int origDur = t.getEstimatedDurationDays();
                    int simDur = simulatedDurations.getOrDefault(t.getId(), origDur);
                    return SimulationDto.TaskComparison.builder()
                            .taskId(t.getId())
                            .taskCode(t.getTaskCode())
                            .taskName(t.getName())
                            .baselineDuration(origDur)
                            .simulatedDuration(simDur)
                            .baselineDueDate(t.getDueDate())
                            .simulatedDueDate(t.getDueDate().plusDays(simDur - origDur))
                            .baselineCost(t.getEstimatedCost())
                            .simulatedCost(simulatedCosts.getOrDefault(t.getId(), t.getEstimatedCost()))
                            .isModified(origDur != simDur)
                            .build();
                })
                .collect(Collectors.toList());

        List<String> insights = new ArrayList<>();
        if (delayDays < 0) {
            insights.add(String.format("Accelerated timeline by %d days through targeted duration adjustments.", Math.abs(delayDays)));
            insights.add("Critical path compression reduces downstream milestone bottleneck risk.");
        } else if (delayDays > 0) {
            insights.add(String.format("Scenario introduces a %d-day schedule slip beyond the planned project handover.", delayDays));
            insights.add("Schedule variance requires authorization or budget contingency deployment.");
        } else {
            insights.add("Schedule duration remains neutral while resource allocations are shifted.");
        }
        insights.add(String.format("Cost differential: %s ₹%,.2f.", costDelta.compareTo(BigDecimal.ZERO) >= 0 ? "+" : "", costDelta));

        return SimulationDto.SimulationResult.builder()
                .scenarioName(request.getScenarioName() != null ? request.getScenarioName() : "Dynamic What-If Analysis")
                .baselineCompletionDate(baselineEndDate)
                .projectedCompletionDate(projectedEndDate)
                .delayDays(delayDays)
                .baselineCost(baselineCost)
                .projectedCost(projectedCost)
                .costDelta(costDelta)
                .baselineRiskScore(baselineRiskScore)
                .projectedRiskScore(projectedRiskScore)
                .riskScoreDelta(projectedRiskScore.subtract(baselineRiskScore))
                .criticalPath(criticalPathNodes)
                .taskComparisons(comparisons)
                .keyInsights(insights)
                .isApplied(false)
                .build();
    }

    @Transactional
    public SimulationScenario saveScenario(SimulationDto.RunRequest request, SimulationDto.SimulationResult result) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        SimulationScenario scenario = SimulationScenario.builder()
                .project(project)
                .name(request.getScenarioName() != null ? request.getScenarioName() : "Saved What-If Scenario")
                .description(request.getScenarioDescription() != null ? request.getScenarioDescription() : "What-If Schedule Scenario")
                .baselineCompletionDate(result.getBaselineCompletionDate())
                .projectedCompletionDate(result.getProjectedCompletionDate())
                .delayDays(result.getDelayDays())
                .costDelta(result.getCostDelta())
                .baselineRiskScore(result.getBaselineRiskScore())
                .projectedRiskScore(result.getProjectedRiskScore())
                .isApplied(false)
                .build();

        scenario = scenarioRepository.save(scenario);

        if (request.getChanges() != null) {
            for (SimulationDto.ParameterChange change : request.getChanges()) {
                Task task = taskRepository.findById(change.getTaskId()).orElse(null);
                if (task != null) {
                    SimulationScenarioChange sc = SimulationScenarioChange.builder()
                            .scenario(scenario)
                            .task(task)
                            .parameterName(change.getParameterName())
                            .originalValue(String.valueOf(task.getEstimatedDurationDays()))
                            .simulatedValue(change.getSimulatedValue())
                            .rationale(change.getRationale())
                            .build();
                    scenarioChangeRepository.save(sc);
                }
            }
        }

        return scenario;
    }

    @Transactional
    public Project applyScenario(Long scenarioId) {
        SimulationScenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Scenario not found with id: " + scenarioId));

        Project project = scenario.getProject();
        List<SimulationScenarioChange> changes = scenarioChangeRepository.findByScenarioId(scenarioId);

        for (SimulationScenarioChange change : changes) {
            Task task = change.getTask();
            if ("DURATION_DAYS".equalsIgnoreCase(change.getParameterName())) {
                int newDur = Integer.parseInt(change.getSimulatedValue());
                task.setEstimatedDurationDays(newDur);
                task.setDueDate(task.getStartDate().plusDays(newDur));
                taskRepository.save(task);
            }
        }

        scenario.setIsApplied(true);
        scenarioRepository.save(scenario);

        project.setPlannedCompletionDate(scenario.getProjectedCompletionDate());
        return projectRepository.save(project);
    }

    public List<SimulationScenario> getScenarios(Long projectId) {
        return scenarioRepository.findByProjectId(projectId);
    }
}
