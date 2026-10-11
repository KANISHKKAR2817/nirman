package com.nirman.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskDto {
    private Long id;
    private Long projectId;
    private Long zoneId;
    private String zoneName;
    private String category;
    private String title;
    private String description;
    private BigDecimal riskScore;
    private String severity;
    private String contributingFactors;
    private String dynamicExplanation;
    private String recommendedAction;
    private String status;
    private String assignedTo;
    private LocalDateTime detectedAt;
    private LocalDateTime resolvedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecalculateResponse {
        private Long projectId;
        private BigDecimal overallScore;
        private BigDecimal scheduleScore;
        private BigDecimal resourceScore;
        private BigDecimal safetyScore;
        private String severity;
        private String summary;
        private List<RiskDto> activeRisks;
        private LocalDateTime calculatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AssessmentHistoryDto {
        private Long id;
        private Long projectId;
        private BigDecimal overallScore;
        private BigDecimal scheduleScore;
        private BigDecimal resourceScore;
        private BigDecimal safetyScore;
        private String severity;
        private String summary;
        private LocalDateTime assessedAt;
    }
}
