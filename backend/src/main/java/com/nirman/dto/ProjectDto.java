package com.nirman.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDto {
    private Long id;
    private String name;
    private String code;
    private String description;
    private String siteAddress;
    private String client;
    private String projectManager;
    private LocalDate startDate;
    private LocalDate plannedCompletionDate;
    private LocalDate actualCompletionDate;
    private BigDecimal totalBudget;
    private String status;
    private BigDecimal progressPercentage;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Project name is required")
        private String name;

        @NotBlank(message = "Project code is required")
        private String code;

        private String description;
        private String siteAddress;
        private String client;
        private String projectManager;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "Planned completion date is required")
        private LocalDate plannedCompletionDate;

        private BigDecimal totalBudget;
        private String status = "ACTIVE";
    }
}
