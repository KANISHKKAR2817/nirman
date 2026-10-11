package com.nirman.controller;

import com.nirman.dto.ZoneDto;
import com.nirman.entity.ConstructionZone;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.ConstructionZoneRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/zones")
@RequiredArgsConstructor
@Tag(name = "Construction Zones", description = "Endpoints for 3D construction zones and building levels")
public class ZoneController {

    private final ConstructionZoneRepository zoneRepository;

    @GetMapping
    @Operation(summary = "List construction zones for a project")
    public ResponseEntity<List<ZoneDto>> getZones(@RequestParam(defaultValue = "1") Long projectId) {
        List<ConstructionZone> zones = zoneRepository.findByProjectId(projectId);
        List<ZoneDto> dtos = zones.stream()
                .map(z -> ZoneDto.builder()
                        .id(z.getId())
                        .projectId(z.getProject().getId())
                        .code(z.getCode())
                        .name(z.getName())
                        .zoneType(z.getZoneType())
                        .floorLevel(z.getFloorLevel())
                        .areaSqm(z.getAreaSqm())
                        .status(z.getStatus())
                        .riskLevel(z.getRiskLevel())
                        .progressPercentage(z.getProgressPercentage())
                        .boundingBoxJson(z.getBoundingBoxJson())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get zone by ID")
    public ResponseEntity<ZoneDto> getZoneById(@PathVariable Long id) {
        ConstructionZone z = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));

        return ResponseEntity.ok(ZoneDto.builder()
                .id(z.getId())
                .projectId(z.getProject().getId())
                .code(z.getCode())
                .name(z.getName())
                .zoneType(z.getZoneType())
                .floorLevel(z.getFloorLevel())
                .areaSqm(z.getAreaSqm())
                .status(z.getStatus())
                .riskLevel(z.getRiskLevel())
                .progressPercentage(z.getProgressPercentage())
                .boundingBoxJson(z.getBoundingBoxJson())
                .build());
    }
}
