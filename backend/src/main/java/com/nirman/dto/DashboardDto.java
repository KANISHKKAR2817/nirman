package com.nirman.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        private Long projectId;
        private String projectName;
        private String projectCode;

        // KPI Cards
        private BigDecimal overallCompletionPercentage;
        private BigDecimal plannedProgressPercentage;
        private Long activeTasksCount;
        private Long overdueTasksCount;
        private Long activeWorkersCount;
        private BigDecimal equipmentUtilizationPercentage;
        private Long lowStockMaterialsCount;
        private BigDecimal budgetSpent;
        private BigDecimal totalBudget;
        private Long openSafetyIncidentsCount;
        private BigDecimal currentRiskScore;
        private String riskSeverity;

        // Visualizations
        private List<ProgressPoint> progressTimeline;
        private Map<String, Long> taskStatusDistribution;
        private List<BudgetCategoryShare> budgetBreakdown;
        private Map<String, Long> riskSeverityDistribution;
        private List<MaterialStockBar> materialStockBars;

        // Activity & Feeds
        private List<MilestoneDto> upcomingMilestones;
        private List<NotificationDto> criticalAlerts;
        private List<AuditLogDto> recentActivity;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressPoint {
        private String date;
        private BigDecimal plannedProgress;
        private BigDecimal actualProgress;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BudgetCategoryShare {
        private String category;
        private BigDecimal planned;
        private BigDecimal actual;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MaterialStockBar {
        private String materialName;
        private BigDecimal available;
        private BigDecimal threshold;
        private String unit;
        private Boolean isLowStock;
    }
}
