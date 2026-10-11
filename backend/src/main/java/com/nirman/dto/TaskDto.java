package com.nirman.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDto {
    private Long id;
    private String taskCode;
    private String name;
    private String description;
    private Long projectId;
    private Long zoneId;
    private String zoneName;
    private String assignedTeam;
    private LocalDate startDate;
    private LocalDate dueDate;
    private LocalDate actualCompletionDate;
    private Integer estimatedDurationDays;
    private BigDecimal progressPercentage;
    private String priority;
    private String status;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private BigDecimal weight;
    private String overrideReason;
    private List<Long> prerequisiteTaskIds;
    private List<String> prerequisiteTaskCodes;
    private Boolean isCriticalPath;
    private Integer slackDays;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Task code is required")
        private String taskCode;

        @NotBlank(message = "Task name is required")
        private String name;

        private String description;
        private Long zoneId;
        private String assignedTeam;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "Due date is required")
        private LocalDate dueDate;

        private Integer estimatedDurationDays = 1;

        @DecimalMin(value = "0.00", message = "Progress must be at least 0%")
        @DecimalMax(value = "100.00", message = "Progress cannot exceed 100%")
        private BigDecimal progressPercentage = BigDecimal.ZERO;

        private String priority = "MEDIUM";
        private String status = "NOT_STARTED";
        private BigDecimal estimatedCost = BigDecimal.ZERO;
        private BigDecimal actualCost = BigDecimal.ZERO;
        private BigDecimal weight = BigDecimal.ONE;
        private List<Long> prerequisiteTaskIds;
        private String overrideReason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressUpdateRequest {
        @NotNull(message = "Progress percentage is required")
        @DecimalMin(value = "0.00", message = "Progress must be at least 0%")
        @DecimalMax(value = "100.00", message = "Progress cannot exceed 100%")
        private BigDecimal progressPercentage;

        private String status;
        private String overrideReason;
    }
}
