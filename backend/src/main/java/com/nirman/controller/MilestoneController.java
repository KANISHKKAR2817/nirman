package com.nirman.controller;

import com.nirman.dto.MilestoneDto;
import com.nirman.entity.Milestone;
import com.nirman.repository.MilestoneRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/milestones")
@RequiredArgsConstructor
@Tag(name = "Milestones", description = "Endpoints for critical project milestones")
public class MilestoneController {

    private final MilestoneRepository milestoneRepository;

    @GetMapping
    @Operation(summary = "List project milestones")
    public ResponseEntity<List<MilestoneDto>> getMilestones(@RequestParam(defaultValue = "1") Long projectId) {
        List<Milestone> list = milestoneRepository.findByProjectIdOrderByTargetDateAsc(projectId);
        List<MilestoneDto> dtos = list.stream()
                .map(m -> MilestoneDto.builder()
                        .id(m.getId())
                        .projectId(m.getProject().getId())
                        .name(m.getName())
                        .description(m.getDescription())
                        .targetDate(m.getTargetDate())
                        .actualDate(m.getActualDate())
                        .status(m.getStatus())
                        .progressPercentage(m.getProgressPercentage())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
