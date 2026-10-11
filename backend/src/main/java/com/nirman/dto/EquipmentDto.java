package com.nirman.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentDto {
    private Long id;
    private String equipmentCode;
    private String name;
    private String category;
    private Long projectId;
    private Long zoneId;
    private String zoneName;
    private String operationalStatus;
    private BigDecimal utilizationPercentage;
    private LocalDate lastMaintenanceDate;
    private LocalDate nextMaintenanceDate;
    private String ownershipStatus;
    private BigDecimal operatingCostPerDay;
    private String assignedOperator;
    private Boolean maintenanceOverdue;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Equipment code is required")
        private String equipmentCode;
        @NotBlank(message = "Equipment name is required")
        private String name;
        @NotBlank(message = "Category is required")
        private String category;
        private Long zoneId;
        private String operationalStatus = "AVAILABLE";
        private BigDecimal utilizationPercentage = BigDecimal.ZERO;
        private LocalDate lastMaintenanceDate;
        private LocalDate nextMaintenanceDate;
        private String ownershipStatus = "OWNED";
        private BigDecimal operatingCostPerDay = BigDecimal.ZERO;
        private String assignedOperator;
    }
}
