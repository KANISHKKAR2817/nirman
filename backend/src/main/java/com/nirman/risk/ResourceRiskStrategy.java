package com.nirman.risk;

import com.nirman.entity.Equipment;
import com.nirman.entity.Material;
import com.nirman.entity.Worker;
import com.nirman.risk.RiskModels.RiskCategoryAssessment;
import com.nirman.risk.RiskModels.RiskScoringContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
public class ResourceRiskStrategy implements RiskAssessmentStrategy {

    @Override
    public String getCategory() {
        return "RESOURCE";
    }

    @Override
    public RiskCategoryAssessment evaluate(RiskScoringContext context) {
        List<Material> materials = context.getMaterials();
        List<Equipment> equipmentList = context.getEquipmentList();
        List<Worker> workers = context.getWorkers();

        // 1. Material low stock ratio
        long lowStockCount = 0;
        long totalMaterials = materials != null ? materials.size() : 0;
        if (materials != null) {
            lowStockCount = materials.stream()
                    .filter(Material::isLowStock)
                    .count();
        }

        // 2. Equipment unavailable or overdue maintenance
        long maintenanceEquipmentCount = 0;
        long totalEquipment = equipmentList != null ? equipmentList.size() : 0;
        if (equipmentList != null) {
            maintenanceEquipmentCount = equipmentList.stream()
                    .filter(e -> "MAINTENANCE".equalsIgnoreCase(e.getOperationalStatus()) ||
                            "UNAVAILABLE".equalsIgnoreCase(e.getOperationalStatus()) ||
                            (e.getNextMaintenanceDate() != null && e.getNextMaintenanceDate().isBefore(LocalDate.now())))
                    .count();
        }

        // 3. Worker shortages / unavailable or expired certifications
        long unavailableWorkersCount = 0;
        long totalWorkers = workers != null ? workers.size() : 0;
        if (workers != null) {
            unavailableWorkersCount = workers.stream()
                    .filter(w -> "UNAVAILABLE".equalsIgnoreCase(w.getAvailability()) ||
                            "EXPIRED".equalsIgnoreCase(w.getSafetyTrainingStatus()) ||
                            "RENEWAL_DUE".equalsIgnoreCase(w.getCertificationStatus()))
                    .count();
        }

        double matRatio = totalMaterials > 0 ? (double) lowStockCount / totalMaterials : 0.0;
        double equipRatio = totalEquipment > 0 ? (double) maintenanceEquipmentCount / totalEquipment : 0.0;
        double workerRatio = totalWorkers > 0 ? (double) unavailableWorkersCount / totalWorkers : 0.0;

        // Weighted Resource Risk Score (Materials 45%, Equipment 35%, Workforce 20%)
        double rawScore = (matRatio * 45.0) + (equipRatio * 35.0) + (workerRatio * 20.0);
        double normalizedScore = Math.min(100.0, rawScore * 2.2); // scaled up
        BigDecimal score = BigDecimal.valueOf(normalizedScore).setScale(2, RoundingMode.HALF_UP);

        String severity = determineSeverity(score);

        String contributingFactors = String.format(
                "%d of %d materials below safety threshold; %d of %d equipment under maintenance/offline; %d of %d workers with certification/availability bottlenecks",
                lowStockCount, totalMaterials, maintenanceEquipmentCount, totalEquipment, unavailableWorkersCount, totalWorkers
        );

        String explanation = String.format(
                "%s Resource Shortage Risk: %d critical construction materials are near or below reorder buffer. " +
                "%d equipment units are currently in maintenance or unavailable. " +
                "Supply chain lead times may compromise the upcoming concrete pour and framing schedule.",
                severity, lowStockCount, maintenanceEquipmentCount
        );

        String recommendedAction = lowStockCount > 0 || maintenanceEquipmentCount > 0
                ? "Issue urgent replenishment purchase orders for low-inventory materials; arrange third-party rental equipment to cover active work packages."
                : "Inventory levels and equipment availability are stable; proceed with planned procurements.";

        return RiskCategoryAssessment.builder()
                .category(getCategory())
                .score(score)
                .severity(severity)
                .contributingFactors(contributingFactors)
                .dynamicExplanation(explanation)
                .recommendedAction(recommendedAction)
                .zoneId(6L) // Yard / Logistics Zone
                .riskTitle("Material & Heavy Machinery Allocation Strain")
                .build();
    }

    private String determineSeverity(BigDecimal score) {
        double val = score.doubleValue();
        if (val >= 75.0) return "CRITICAL";
        if (val >= 50.0) return "HIGH";
        if (val >= 25.0) return "MODERATE";
        return "LOW";
    }
}
