package com.nirman.service;

import com.nirman.dto.WorkerDto;
import com.nirman.entity.*;
import com.nirman.exception.BusinessValidationException;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final ProjectRepository projectRepository;
    private final ConstructionZoneRepository zoneRepository;
    private final TaskRepository taskRepository;
    private final WorkerAssignmentRepository assignmentRepository;
    private final AuditLogService auditLogService;

    public List<WorkerDto> getWorkers(Long projectId, String availability, Long zoneId) {
        List<Worker> list;
        if (zoneId != null) {
            list = workerRepository.findByZoneId(zoneId);
        } else if (availability != null && !availability.isEmpty()) {
            list = workerRepository.findByProjectIdAndAvailability(projectId, availability);
        } else {
            list = workerRepository.findByProjectId(projectId);
        }

        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public WorkerDto getWorkerById(Long id) {
        Worker w = workerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + id));
        return mapToDto(w);
    }

    @Transactional
    public WorkerDto registerWorker(Long projectId, WorkerDto.CreateUpdateRequest request, String actor) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ConstructionZone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId()).orElse(null);
        }

        Worker worker = Worker.builder()
                .workerCode(request.getWorkerCode())
                .name(request.getName())
                .role(request.getRole())
                .project(project)
                .zone(zone)
                .shift(request.getShift() != null ? request.getShift() : "DAY")
                .phone(request.getPhone())
                .email(request.getEmail())
                .skillCategory(request.getSkillCategory())
                .certificationStatus(request.getCertificationStatus() != null ? request.getCertificationStatus() : "ACTIVE")
                .safetyTrainingStatus(request.getSafetyTrainingStatus() != null ? request.getSafetyTrainingStatus() : "CERTIFIED")
                .availability(request.getAvailability() != null ? request.getAvailability() : "AVAILABLE")
                .build();

        Worker saved = workerRepository.save(worker);
        auditLogService.record(projectId, actor, "REGISTER_WORKER", "WORKER", saved.getId(),
                "Registered worker: " + saved.getName() + " (" + saved.getRole() + ")", null);

        return mapToDto(saved);
    }

    @Transactional
    public WorkerDto assignWorkerToTask(WorkerDto.AssignmentRequest request, String actor) {
        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found with id: " + request.getWorkerId()));

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));

        // Section 8 Rule: Prevent assigning unavailable workers
        if ("UNAVAILABLE".equalsIgnoreCase(worker.getAvailability())) {
            throw new BusinessValidationException("Cannot assign worker " + worker.getName() + ": Status is UNAVAILABLE.");
        }

        WorkerAssignment assignment = WorkerAssignment.builder()
                .worker(worker)
                .task(task)
                .assignedDate(request.getAssignedDate() != null ? request.getAssignedDate() : LocalDate.now())
                .roleInTask(request.getRoleInTask() != null ? request.getRoleInTask() : worker.getRole())
                .build();
        assignmentRepository.save(assignment);

        worker.setAvailability("ASSIGNED");
        if (task.getZone() != null) {
            worker.setZone(task.getZone());
        }
        Worker updated = workerRepository.save(worker);

        auditLogService.record(task.getProject().getId(), actor, "ASSIGN_WORKER", "WORKER", worker.getId(),
                "Assigned worker " + worker.getName() + " to task " + task.getTaskCode(), null);

        return mapToDto(updated);
    }

    private WorkerDto mapToDto(Worker w) {
        return WorkerDto.builder()
                .id(w.getId())
                .workerCode(w.getWorkerCode())
                .name(w.getName())
                .role(w.getRole())
                .projectId(w.getProject().getId())
                .zoneId(w.getZone() != null ? w.getZone().getId() : null)
                .zoneName(w.getZone() != null ? w.getZone().getName() : "General Site")
                .shift(w.getShift())
                .phone(w.getPhone())
                .email(w.getEmail())
                .skillCategory(w.getSkillCategory())
                .certificationStatus(w.getCertificationStatus())
                .safetyTrainingStatus(w.getSafetyTrainingStatus())
                .availability(w.getAvailability())
                .build();
    }
}
