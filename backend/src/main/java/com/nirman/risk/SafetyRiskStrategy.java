package com.nirman.risk;

import com.nirman.entity.SafetyIncident;
import com.nirman.risk.RiskModels.RiskCategoryAssessment;
import com.nirman.risk.RiskModels.RiskScoringContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class SafetyRiskStrategy implements RiskAssessmentStrategy {

    @Override
    public String getCategory() {
        return "SAFETY";
    }

    @Override
    public RiskCategoryAssessment evaluate(RiskScoringContext context) {
        List<SafetyIncident> incidents = context.getIncidents();

        long openIncidents = 0;
        long criticalIncidents = 0;
        long highIncidents = 0;
        long mediumIncidents = 0;

        if (incidents != null) {
            for (SafetyIncident incident : incidents) {
                if ("OPEN".equalsIgnoreCase(incident.getStatus()) ||
                        "INVESTIGATING".equalsIgnoreCase(incident.getStatus()) ||
                        "ACTION_REQUIRED".equalsIgnoreCase(incident.getStatus())) {
                    openIncidents++;
                    if ("CRITICAL".equalsIgnoreCase(incident.getSeverity())) {
                        criticalIncidents++;
                    } else if ("HIGH".equalsIgnoreCase(incident.getSeverity())) {
                        highIncidents++;
                    } else {
                        mediumIncidents++;
                    }
                }
            }
        }

        // Safety scoring calculation:
        // Critical open incidents (40 pts each), High open incidents (25 pts each), Medium (10 pts each)
        double scorePoints = (criticalIncidents * 40.0) + (highIncidents * 25.0) + (mediumIncidents * 10.0);
        double normalizedScore = Math.min(100.0, Math.max(10.0, scorePoints)); // minimum baseline 10 if active site
        BigDecimal score = BigDecimal.valueOf(normalizedScore).setScale(2, RoundingMode.HALF_UP);

        String severity = determineSeverity(score);

        String contributingFactors = String.format(
                "%d open safety incidents (%d critical, %d high, %d medium/low severity)",
                openIncidents, criticalIncidents, highIncidents, mediumIncidents
        );

        String explanation = String.format(
                "%s Safety & Operational Hazard Risk: %d unmitigated safety hazards are active across construction zones, " +
                "including %d high/critical severity items. " +
                "Edge protection, LOTO compliance, and fall-prevention measures require urgent safety audit signoff.",
                severity, openIncidents, (criticalIncidents + highIncidents)
        );

        String recommendedAction = (criticalIncidents + highIncidents) > 0
                ? "Conduct an immediate toolbox safety stand-down in affected zones; mandate edge protection barriers and tag-out verification before high-elevation activities."
                : "Continue routine daily safety marshal briefings and PPE verification checklists.";

        Long primaryZoneId = (incidents != null)
                ? incidents.stream()
                .filter(i -> "OPEN".equalsIgnoreCase(i.getStatus()) || "ACTION_REQUIRED".equalsIgnoreCase(i.getStatus()))
                .filter(i -> i.getZone() != null)
                .map(i -> i.getZone().getId())
                .findFirst()
                .orElse(null)
                : null;

        return RiskCategoryAssessment.builder()
                .category(getCategory())
                .score(score)
                .severity(severity)
                .contributingFactors(contributingFactors)
                .dynamicExplanation(explanation)
                .recommendedAction(recommendedAction)
                .zoneId(primaryZoneId != null ? primaryZoneId : 4L)
                .riskTitle("Operational Hazard & Working-at-Height Safety")
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
