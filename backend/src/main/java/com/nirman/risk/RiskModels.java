package com.nirman.risk;

import com.nirman.entity.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class RiskModels {

    @Data
    @Builder
    public static class RiskCategoryAssessment {
        private String category; // SCHEDULE, RESOURCE, SAFETY
        private BigDecimal score; // 0.0 to 100.0
        private String severity; // LOW, MODERATE, HIGH, CRITICAL
        private String contributingFactors;
        private String dynamicExplanation;
        private String recommendedAction;
        private Long zoneId;
        private String riskTitle;
    }

    @Data
    @Builder
    public static class RiskScoringContext {
        private Project project;
        private List<Task> tasks;
        private List<Material> materials;
        private List<Equipment> equipmentList;
        private List<Worker> workers;
        private List<SafetyIncident> incidents;
        private List<ConstructionZone> zones;
    }
}
