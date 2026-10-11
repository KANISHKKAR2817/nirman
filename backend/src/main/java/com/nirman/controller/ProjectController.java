package com.nirman.controller;

import com.nirman.dto.ProjectDto;
import com.nirman.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Endpoints for managing construction projects")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "List all construction projects")
    public ResponseEntity<List<ProjectDto>> getProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed project by ID")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    @Operation(summary = "Create new construction project")
    public ResponseEntity<ProjectDto> createProject(
            @Valid @RequestBody ProjectDto.CreateUpdateRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(projectService.createProject(request, actor));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update construction project details")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDto.CreateUpdateRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(projectService.updateProject(id, request, actor));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive construction project")
    public ResponseEntity<Void> archiveProject(@PathVariable Long id, Authentication authentication) {
        String actor = authentication != null ? authentication.getName() : "system";
        projectService.archiveProject(id, actor);
        return ResponseEntity.noContent().build();
    }
}
