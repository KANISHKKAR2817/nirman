package com.nirman.risk;

import com.nirman.entity.Task;
import com.nirman.risk.RiskModels.RiskCategoryAssessment;
import com.nirman.risk.RiskModels.RiskScoringContext;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
public class ScheduleRiskStrategy implements RiskAssessmentStrategy {

    @Override
    public String getCategory() {
        return "SCHEDULE";
    }

    @Override
    public RiskCategoryAssessment evaluate(RiskScoringContext context) {
        List<Task> tasks = context.getTasks();
        if (tasks == null || tasks.isEmpty()) {
            return RiskCategoryAssessment.builder()
                    .category(getCategory())
                    .score(BigDecimal.ZERO)
                    .severity("LOW")
                    .contributingFactors("No tasks recorded for project")
                    .dynamicExplanation("Project has no active or scheduled tasks.")
                    .recommendedAction("Initialize project baseline schedule and assign tasks.")
                    .riskTitle("Schedule Baseline Required")
                    .build();
        }

        long totalTasks = tasks.size();
        long overdueTasks = tasks.stream()
                .filter(t -> "OVERDUE".equalsIgnoreCase(t.getStatus()) ||
                        (t.getDueDate().isBefore(LocalDate.now()) && !"COMPLETED".equalsIgnoreCase(t.getStatus())))
                .count();

        long blockedTasks = tasks.stream()
                .filter(t -> "BLOCKED".equalsIgnoreCase(t.getStatus()))
                .count();

        long inProgressTasks = tasks.stream()
                .filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
                .count();

        // Calculate weighted progress vs planned expected progress
        double actualProgressAvg = tasks.stream()
                .mapToDouble(t -> t.getProgressPercentage().doubleValue())
                .average()
                .orElse(0.0);

        // Schedule scoring formula:
        // Overdue task ratio (40%) + Blocked task ratio (30%) + Schedule slippage deficit (30%)
        double overdueRatio = (double) overdueTasks / totalTasks;
        double blockedRatio = (double) blockedTasks / totalTasks;
        double slippageDeficit = Math.max(0.0, (55.0 - actualProgressAvg) / 100.0);

        double rawScore = (overdueRatio * 45.0) + (blockedRatio * 30.0) + (slippageDeficit * 25.0);
        double normalizedScore = Math.min(100.0, Math.max(0.0, rawScore * 100.0 / 45.0)); // normalize to 0-100
        BigDecimal score = BigDecimal.valueOf(normalizedScore).setScale(2, RoundingMode.HALF_UP);

        String severity = determineSeverity(score);

        String contributingFactors = String.format(
                "%d of %d tasks are overdue (%.1f%%); %d tasks are blocked; avg task progress is %.1f%%",
                overdueTasks, totalTasks, overdueRatio * 100, blockedTasks, actualProgressAvg
        );

        String explanation = String.format(
                "%s Schedule Delay Risk: %d tasks are overdue and %d tasks are blocked. " +
                "Actual project average progress (%.1f%%) lags behind expected milestones. " +
                "Critical path activities require immediate float-recovery interventions.",
                severity, overdueTasks, blockedTasks, actualProgressAvg
        );

        String recommendedAction = overdueTasks > 0
                ? "Reallocate secondary workforce to overdue tasks; resolve blocked predecessor dependencies; review critical path float."
                : "Maintain current cycle tempo and monitor critical path dependencies.";

        Long primaryZoneId = tasks.stream()
                .filter(t -> "OVERDUE".equalsIgnoreCase(t.getStatus()) || "BLOCKED".equalsIgnoreCase(t.getStatus()))
                .filter(t -> t.getZone() != null)
                .map(t -> t.getZone().getId())
                .findFirst()
                .orElse(null);

        return RiskCategoryAssessment.builder()
                .category(getCategory())
                .score(score)
                .severity(severity)
                .contributingFactors(contributingFactors)
                .dynamicExplanation(explanation)
                .recommendedAction(recommendedAction)
                .zoneId(primaryZoneId)
                .riskTitle("Schedule Delay & Critical Path Bottleneck")
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
