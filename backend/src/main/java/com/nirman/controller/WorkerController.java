package com.nirman.controller;

import com.nirman.dto.WorkerDto;
import com.nirman.service.WorkerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workers")
@RequiredArgsConstructor
@Tag(name = "Workforce", description = "Endpoints for managing site crews, skill certifications, and task assignments")
public class WorkerController {

    private final WorkerService workerService;

    @GetMapping
    @Operation(summary = "List project workers with availability and zone filters")
    public ResponseEntity<List<WorkerDto>> getWorkers(
            @RequestParam(defaultValue = "1") Long projectId,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) Long zoneId
    ) {
        return ResponseEntity.ok(workerService.getWorkers(projectId, availability, zoneId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get worker details by ID")
    public ResponseEntity<WorkerDto> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @PostMapping
    @Operation(summary = "Register new construction worker")
    public ResponseEntity<WorkerDto> registerWorker(
            @RequestParam(defaultValue = "1") Long projectId,
            @Valid @RequestBody WorkerDto.CreateUpdateRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(workerService.registerWorker(projectId, request, actor));
    }

    @PostMapping("/assign")
    @Operation(summary = "Assign worker to specific task")
    public ResponseEntity<WorkerDto> assignWorker(
            @Valid @RequestBody WorkerDto.AssignmentRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(workerService.assignWorkerToTask(request, actor));
    }
}
