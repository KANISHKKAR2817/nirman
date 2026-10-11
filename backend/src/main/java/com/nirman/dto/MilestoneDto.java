package com.nirman.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilestoneDto {
    private Long id;
    private Long projectId;
    private String name;
    private String description;
    private LocalDate targetDate;
    private LocalDate actualDate;
    private String status;
    private BigDecimal progressPercentage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Milestone name is required")
        private String name;
        private String description;
        @NotNull(message = "Target date is required")
        private LocalDate targetDate;
        private LocalDate actualDate;
        private String status = "PENDING";
        private BigDecimal progressPercentage = BigDecimal.ZERO;
    }
}
