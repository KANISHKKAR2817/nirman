package com.nirman.controller;

import com.nirman.dto.RiskDto;
import com.nirman.risk.RiskEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/risks")
@RequiredArgsConstructor
@Tag(name = "Risk Prediction Engine", description = "Endpoints for deterministic, explainable risk calculations and snapshots")
public class RiskController {

    private final RiskEngineService riskEngineService;

    @GetMapping
    @Operation(summary = "Get current active risks with dynamic explanations and recommendations")
    public ResponseEntity<List<RiskDto>> getRisks(@RequestParam(defaultValue = "1") Long projectId) {
        return ResponseEntity.ok(riskEngineService.getProjectRisks(projectId));
    }

    @PostMapping("/recalculate")
    @Operation(summary = "Trigger deterministic rule-based risk reassessment using current project data")
    public ResponseEntity<RiskDto.RecalculateResponse> recalculateRisk(@RequestParam(defaultValue = "1") Long projectId) {
        return ResponseEntity.ok(riskEngineService.recalculateProjectRisk(projectId));
    }

    @GetMapping("/history")
    @Operation(summary = "Get historical risk assessment score trends")
    public ResponseEntity<List<RiskDto.AssessmentHistoryDto>> getRiskHistory(@RequestParam(defaultValue = "1") Long projectId) {
        return ResponseEntity.ok(riskEngineService.getRiskHistory(projectId));
    }
}
