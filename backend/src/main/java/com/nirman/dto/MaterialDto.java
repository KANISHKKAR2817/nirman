package com.nirman.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaterialDto {
    private Long id;
    private String materialCode;
    private String name;
    private String category;
    private String unit;
    private BigDecimal availableQuantity;
    private BigDecimal reservedQuantity;
    private BigDecimal freeQuantity;
    private BigDecimal reorderThreshold;
    private BigDecimal unitPrice;
    private BigDecimal stockValuation;
    private String supplierName;
    private Long storageZoneId;
    private String storageZoneName;
    private Boolean isLowStock;
    private LocalDateTime lastUpdated;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Material code is required")
        private String materialCode;
        @NotBlank(message = "Material name is required")
        private String name;
        @NotBlank(message = "Category is required")
        private String category;
        @NotBlank(message = "Unit is required")
        private String unit;
        @NotNull(message = "Available quantity is required")
        @DecimalMin(value = "0.00", message = "Quantity cannot be negative")
        private BigDecimal availableQuantity;
        private BigDecimal reservedQuantity = BigDecimal.ZERO;
        private BigDecimal reorderThreshold = BigDecimal.ZERO;
        private BigDecimal unitPrice = BigDecimal.ZERO;
        private String supplierName;
        private Long storageZoneId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsumeRequest {
        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
        private BigDecimal quantity;
        private Long referenceTaskId;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiveRequest {
        @NotNull(message = "Quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private String notes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TransactionDto {
        private Long id;
        private Long materialId;
        private String materialName;
        private String transactionType;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private Long referenceTaskId;
        private String referenceTaskCode;
        private String notes;
        private String createdBy;
        private LocalDateTime createdAt;
    }
}
