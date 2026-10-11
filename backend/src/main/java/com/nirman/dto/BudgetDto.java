package com.nirman.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class BudgetDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EntryDto {
        private Long id;
        private Long projectId;
        private String category;
        private BigDecimal plannedAmount;
        private BigDecimal committedAmount;
        private BigDecimal actualExpenditure;
        private BigDecimal variance;
        private String periodMonth;
        private Integer fiscalYear;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryDto {
        private Long projectId;
        private BigDecimal totalBudget;
        private BigDecimal plannedBudget;
        private BigDecimal committedBudget;
        private BigDecimal actualExpenditure;
        private BigDecimal remainingBudget;
        private BigDecimal budgetVariance;
        private BigDecimal utilizationPercentage;
        private BigDecimal estimatedCostAtCompletion;
        private List<EntryDto> categoryEntries;
    }
}
