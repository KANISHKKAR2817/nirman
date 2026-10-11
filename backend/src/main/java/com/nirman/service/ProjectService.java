package com.nirman.service;

import com.nirman.dto.ProjectDto;
import com.nirman.entity.Project;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;

    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProjectDto getProjectById(Long id) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDto(p);
    }

    @Transactional
    public ProjectDto createProject(ProjectDto.CreateUpdateRequest request, String actor) {
        Project project = Project.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .siteAddress(request.getSiteAddress())
                .client(request.getClient())
                .projectManager(request.getProjectManager())
                .startDate(request.getStartDate())
                .plannedCompletionDate(request.getPlannedCompletionDate())
                .totalBudget(request.getTotalBudget() != null ? request.getTotalBudget() : BigDecimal.ZERO)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .progressPercentage(BigDecimal.ZERO)
                .build();

        Project saved = projectRepository.save(project);
        auditLogService.record(saved.getId(), actor, "CREATE_PROJECT", "PROJECT", saved.getId(),
                "Created new project: " + saved.getName(), null);
        return mapToDto(saved);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto.CreateUpdateRequest request, String actor) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        p.setName(request.getName());
        p.setCode(request.getCode());
        p.setDescription(request.getDescription());
        p.setSiteAddress(request.getSiteAddress());
        p.setClient(request.getClient());
        p.setProjectManager(request.getProjectManager());
        p.setStartDate(request.getStartDate());
        p.setPlannedCompletionDate(request.getPlannedCompletionDate());
        if (request.getTotalBudget() != null) {
            p.setTotalBudget(request.getTotalBudget());
        }
        if (request.getStatus() != null) {
            p.setStatus(request.getStatus());
        }

        Project updated = projectRepository.save(p);
        auditLogService.record(updated.getId(), actor, "UPDATE_PROJECT", "PROJECT", updated.getId(),
                "Updated project metadata: " + updated.getName(), null);
        return mapToDto(updated);
    }

    @Transactional
    public void archiveProject(Long id, String actor) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        p.setStatus("ARCHIVED");
        projectRepository.save(p);
        auditLogService.record(id, actor, "ARCHIVE_PROJECT", "PROJECT", id, "Archived project", null);
    }

    public ProjectDto mapToDto(Project p) {
        return ProjectDto.builder()
                .id(p.getId())
                .name(p.getName())
                .code(p.getCode())
                .description(p.getDescription())
                .siteAddress(p.getSiteAddress())
                .client(p.getClient())
                .projectManager(p.getProjectManager())
                .startDate(p.getStartDate())
                .plannedCompletionDate(p.getPlannedCompletionDate())
                .actualCompletionDate(p.getActualCompletionDate())
                .totalBudget(p.getTotalBudget())
                .status(p.getStatus())
                .progressPercentage(p.getProgressPercentage())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
