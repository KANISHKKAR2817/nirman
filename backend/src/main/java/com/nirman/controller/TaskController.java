package com.nirman.controller;

import com.nirman.dto.TaskDto;
import com.nirman.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks & Progress", description = "Endpoints for construction work packages, CPM schedules, and status tracking")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @Operation(summary = "List project tasks with CPM float and dependency status")
    public ResponseEntity<List<TaskDto>> getTasks(
            @RequestParam(defaultValue = "1") Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long zoneId
    ) {
        return ResponseEntity.ok(taskService.getTasks(projectId, status, zoneId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task details by ID")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @Operation(summary = "Create new construction task")
    public ResponseEntity<TaskDto> createTask(
            @RequestParam(defaultValue = "1") Long projectId,
            @Valid @RequestBody TaskDto.CreateUpdateRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(taskService.createTask(projectId, request, actor));
    }

    @PatchMapping("/{id}/progress")
    @Operation(summary = "Update task completion progress and status with dependency check")
    public ResponseEntity<TaskDto> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody TaskDto.ProgressUpdateRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(taskService.updateProgress(id, request, actor));
    }
}
