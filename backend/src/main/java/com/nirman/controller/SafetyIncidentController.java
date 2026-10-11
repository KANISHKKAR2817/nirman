package com.nirman.controller;

import com.nirman.dto.SafetyIncidentDto;
import com.nirman.service.SafetyIncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Safety & Incidents", description = "Endpoints for reporting hazards, incident tracking, and corrective actions")
public class SafetyIncidentController {

    private final SafetyIncidentService incidentService;

    @GetMapping
    @Operation(summary = "List safety incidents and hazards")
    public ResponseEntity<List<SafetyIncidentDto>> getIncidents(
            @RequestParam(defaultValue = "1") Long projectId,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(incidentService.getIncidents(projectId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get safety incident by ID")
    public ResponseEntity<SafetyIncidentDto> getIncidentById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @PostMapping
    @Operation(summary = "Report a new safety hazard or incident")
    public ResponseEntity<SafetyIncidentDto> createIncident(
            @RequestParam(defaultValue = "1") Long projectId,
            @Valid @RequestBody SafetyIncidentDto.CreateUpdateRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(incidentService.createIncident(projectId, request, actor));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update incident status and corrective action notes")
    public ResponseEntity<SafetyIncidentDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String correctiveActions,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, status, correctiveActions, actor));
    }
}
