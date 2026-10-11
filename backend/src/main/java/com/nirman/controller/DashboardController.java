package com.nirman.controller;

import com.nirman.dto.DashboardDto;
import com.nirman.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Aggregated KPIs and charts for Construction Command Center")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @Operation(summary = "Get full executive dashboard metrics, KPIs, and chart data")
    public ResponseEntity<DashboardDto.SummaryResponse> getDashboard(
            @RequestParam(defaultValue = "1") Long projectId
    ) {
        return ResponseEntity.ok(dashboardService.getDashboardSummary(projectId));
    }
}
