package com.nirman.controller;

import com.nirman.dto.BudgetDto;
import com.nirman.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/budget")
@RequiredArgsConstructor
@Tag(name = "Budget & Costs", description = "Endpoints for financial intelligence, EAC, and cost variance")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "Get project budget summary, category breakdowns, variance, and EAC")
    public ResponseEntity<BudgetDto.SummaryDto> getBudgetSummary(
            @RequestParam(defaultValue = "1") Long projectId
    ) {
        return ResponseEntity.ok(budgetService.getBudgetSummary(projectId));
    }
}
