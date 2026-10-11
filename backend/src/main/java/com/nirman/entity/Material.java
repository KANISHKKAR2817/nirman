package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "material_code", nullable = false, unique = true, length = 30)
    private String materialCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "available_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal availableQuantity;

    @Column(name = "reserved_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal reservedQuantity;

    @Column(name = "reorder_threshold", nullable = false, precision = 12, scale = 2)
    private BigDecimal reorderThreshold;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "storage_zone_id")
    private ConstructionZone storageZone;

    @Column(name = "last_updated", insertable = false, updatable = false)
    private LocalDateTime lastUpdated;

    // Domain helper: free stock calculation
    public BigDecimal getFreeQuantity() {
        if (availableQuantity == null) return BigDecimal.ZERO;
        if (reservedQuantity == null) return availableQuantity;
        BigDecimal free = availableQuantity.subtract(reservedQuantity);
        return free.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : free;
    }

    public boolean isLowStock() {
        return availableQuantity != null && reorderThreshold != null
                && availableQuantity.compareTo(reorderThreshold) <= 0;
    }
}
