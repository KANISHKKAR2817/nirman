package com.nirman.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class SimulationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParameterChange {
        private Long taskId;
        private String parameterName; // e.g. "DURATION_DAYS", "WORKERS_ADDED", "START_DELAY_DAYS"
        private String simulatedValue;
        private String rationale;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RunRequest {
        private Long projectId;
        private String scenarioName;
        private String scenarioDescription;
        private List<ParameterChange> changes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SimulationResult {
        private Long scenarioId;
        private String scenarioName;
        private LocalDate baselineCompletionDate;
        private LocalDate projectedCompletionDate;
        private Integer delayDays;
        private BigDecimal baselineCost;
        private BigDecimal projectedCost;
        private BigDecimal costDelta;
        private BigDecimal baselineRiskScore;
        private BigDecimal projectedRiskScore;
        private BigDecimal riskScoreDelta;
        private List<CriticalPathNode> criticalPath;
        private List<TaskComparison> taskComparisons;
        private List<String> keyInsights;
        private Boolean isApplied;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriticalPathNode {
        private Long taskId;
        private String taskCode;
        private String taskName;
        private Integer durationDays;
        private Integer earlyStartDay;
        private Integer earlyFinishDay;
        private Integer lateStartDay;
        private Integer lateFinishDay;
        private Integer slackDays;
        private Boolean isCritical;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskComparison {
        private Long taskId;
        private String taskCode;
        private String taskName;
        private Integer baselineDuration;
        private Integer simulatedDuration;
        private LocalDate baselineDueDate;
        private LocalDate simulatedDueDate;
        private BigDecimal baselineCost;
        private BigDecimal simulatedCost;
        private Boolean isModified;
    }
}
