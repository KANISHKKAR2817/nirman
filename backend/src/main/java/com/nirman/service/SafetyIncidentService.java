package com.nirman.service;

import com.nirman.dto.SafetyIncidentDto;
import com.nirman.entity.*;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SafetyIncidentService {

    private final SafetyIncidentRepository incidentRepository;
    private final ProjectRepository projectRepository;
    private final ConstructionZoneRepository zoneRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public List<SafetyIncidentDto> getIncidents(Long projectId, String status) {
        List<SafetyIncident> list = (status != null && !status.isEmpty())
                ? incidentRepository.findByProjectIdAndStatus(projectId, status)
                : incidentRepository.findByProjectId(projectId);

        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SafetyIncidentDto getIncidentById(Long id) {
        SafetyIncident i = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
        return mapToDto(i);
    }

    @Transactional
    public SafetyIncidentDto createIncident(Long projectId, SafetyIncidentDto.CreateUpdateRequest request, String actor) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ConstructionZone zone = null;
        if (request.getZoneId() != null) {
            zone = zoneRepository.findById(request.getZoneId()).orElse(null);
        }

        long count = incidentRepository.count();
        String code = String.format("INC-%d-%02d", LocalDate.now().getYear(), count + 1);

        SafetyIncident incident = SafetyIncident.builder()
                .incidentCode(code)
                .project(project)
                .zone(zone)
                .title(request.getTitle())
                .description(request.getDescription())
                .severity(request.getSeverity() != null ? request.getSeverity() : "MEDIUM")
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .reportedBy(request.getReportedBy() != null ? request.getReportedBy() : actor)
                .assignedTo(request.getAssignedTo())
                .incidentDate(request.getIncidentDate())
                .targetResolutionDate(request.getTargetResolutionDate())
                .correctiveActions(request.getCorrectiveActions())
                .build();

        SafetyIncident saved = incidentRepository.save(incident);

        if ("CRITICAL".equalsIgnoreCase(saved.getSeverity()) || "HIGH".equalsIgnoreCase(saved.getSeverity())) {
            notificationService.createNotification(
                    projectId,
                    "High Safety Hazard: " + saved.getTitle(),
                    "Incident " + saved.getIncidentCode() + " reported in " + (zone != null ? zone.getName() : "Site") + ". Action required.",
                    "CRITICAL", "SAFETY", "SAFETY_INCIDENT", saved.getId()
            );
        }

        auditLogService.record(projectId, actor, "CREATE_INCIDENT", "SAFETY_INCIDENT", saved.getId(),
                "Reported hazard " + saved.getIncidentCode() + ": " + saved.getTitle(), null);

        return mapToDto(saved);
    }

    @Transactional
    public SafetyIncidentDto updateIncidentStatus(Long id, String status, String correctiveActions, String actor) {
        SafetyIncident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));

        incident.setStatus(status);
        if (correctiveActions != null) {
            incident.setCorrectiveActions(correctiveActions);
        }
        if ("RESOLVED".equalsIgnoreCase(status) || "CLOSED".equalsIgnoreCase(status)) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        SafetyIncident saved = incidentRepository.save(incident);
        auditLogService.record(incident.getProject().getId(), actor, "UPDATE_INCIDENT_STATUS", "SAFETY_INCIDENT", saved.getId(),
                "Updated incident " + saved.getIncidentCode() + " status to " + status, null);

        return mapToDto(saved);
    }

    private SafetyIncidentDto mapToDto(SafetyIncident i) {
        return SafetyIncidentDto.builder()
                .id(i.getId())
                .incidentCode(i.getIncidentCode())
                .projectId(i.getProject().getId())
                .zoneId(i.getZone() != null ? i.getZone().getId() : null)
                .zoneName(i.getZone() != null ? i.getZone().getName() : "General Site")
                .title(i.getTitle())
                .description(i.getDescription())
                .severity(i.getSeverity())
                .status(i.getStatus())
                .reportedBy(i.getReportedBy())
                .assignedTo(i.getAssignedTo())
                .incidentDate(i.getIncidentDate())
                .targetResolutionDate(i.getTargetResolutionDate())
                .correctiveActions(i.getCorrectiveActions())
                .resolvedAt(i.getResolvedAt())
                .createdAt(i.getCreatedAt() != null ? i.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
