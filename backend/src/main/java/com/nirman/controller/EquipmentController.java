package com.nirman.controller;

import com.nirman.dto.EquipmentDto;
import com.nirman.service.EquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
@RequiredArgsConstructor
@Tag(name = "Equipment & Machinery", description = "Endpoints for tower cranes, excavators, pumps, and fleet status")
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    @Operation(summary = "List site equipment with utilization and maintenance flags")
    public ResponseEntity<List<EquipmentDto>> getEquipment(
            @RequestParam(defaultValue = "1") Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long zoneId
    ) {
        return ResponseEntity.ok(equipmentService.getEquipment(projectId, status, zoneId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get equipment by ID")
    public ResponseEntity<EquipmentDto> getEquipmentById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.getEquipmentById(id));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update operational status (AVAILABLE, IN_USE, MAINTENANCE, UNAVAILABLE)")
    public ResponseEntity<EquipmentDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Long zoneId,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(equipmentService.updateStatus(id, status, zoneId, actor));
    }
}
