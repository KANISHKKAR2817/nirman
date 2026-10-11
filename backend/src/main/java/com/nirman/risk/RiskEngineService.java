package com.nirman.risk;

import com.nirman.dto.RiskDto;
import com.nirman.entity.*;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import com.nirman.risk.RiskModels.RiskCategoryAssessment;
import com.nirman.risk.RiskModels.RiskScoringContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RiskEngineService {

    private final List<RiskAssessmentStrategy> strategies;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MaterialRepository materialRepository;
    private final EquipmentRepository equipmentRepository;
    private final WorkerRepository workerRepository;
    private final SafetyIncidentRepository incidentRepository;
    private final ConstructionZoneRepository zoneRepository;
    private final RiskRepository riskRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;

    @Value("${nirman.risk.weights.schedule:0.40}")
    private double scheduleWeight;

    @Value("${nirman.risk.weights.resource:0.35}")
    private double resourceWeight;

    @Value("${nirman.risk.weights.safety:0.25}")
    private double safetyWeight;

    @Transactional
    public RiskDto.RecalculateResponse recalculateProjectRisk(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        RiskScoringContext context = RiskScoringContext.builder()
                .project(project)
                .tasks(taskRepository.findByProjectId(projectId))
                .materials(materialRepository.findAll())
                .equipmentList(equipmentRepository.findByProjectId(projectId))
                .workers(workerRepository.findByProjectId(projectId))
                .incidents(incidentRepository.findByProjectId(projectId))
                .zones(zoneRepository.findByProjectId(projectId))
                .build();

        RiskCategoryAssessment scheduleAssess = null;
        RiskCategoryAssessment resourceAssess = null;
        RiskCategoryAssessment safetyAssess = null;

        for (RiskAssessmentStrategy strategy : strategies) {
            RiskCategoryAssessment result = strategy.evaluate(context);
            if ("SCHEDULE".equalsIgnoreCase(strategy.getCategory())) {
                scheduleAssess = result;
            } else if ("RESOURCE".equalsIgnoreCase(strategy.getCategory())) {
                resourceAssess = result;
            } else if ("SAFETY".equalsIgnoreCase(strategy.getCategory())) {
                safetyAssess = result;
            }
        }

        BigDecimal scheduleScore = scheduleAssess != null ? scheduleAssess.getScore() : BigDecimal.ZERO;
        BigDecimal resourceScore = resourceAssess != null ? resourceAssess.getScore() : BigDecimal.ZERO;
        BigDecimal safetyScore = safetyAssess != null ? safetyAssess.getScore() : BigDecimal.ZERO;

        // Weighted Overall Score = (Sched * W_sched) + (Res * W_res) + (Safe * W_safe)
        double totalWeighted = (scheduleScore.doubleValue() * scheduleWeight) +
                (resourceScore.doubleValue() * resourceWeight) +
                (safetyScore.doubleValue() * safetyWeight);

        BigDecimal overallScore = BigDecimal.valueOf(totalWeighted).setScale(2, RoundingMode.HALF_UP);
        String overallSeverity = determineSeverity(overallScore);

        String summary = String.format(
                "Project %s risk score is %s (%s). Schedule Score: %s, Resource Score: %s, Safety Score: %s.",
                project.getCode(), overallScore, overallSeverity, scheduleScore, resourceScore, safetyScore
        );

        // Persist Risk Assessment snapshot
        RiskAssessment assessment = RiskAssessment.builder()
                .project(project)
                .overallScore(overallScore)
                .scheduleScore(scheduleScore)
                .resourceScore(resourceScore)
                .safetyScore(safetyScore)
                .severity(overallSeverity)
                .summary(summary)
                .build();
        riskAssessmentRepository.save(assessment);

        // Update or create active risk records for each category
        List<Risk> currentRisks = riskRepository.findByProjectId(projectId);
        updateOrCreateCategoryRisk(project, currentRisks, scheduleAssess);
        updateOrCreateCategoryRisk(project, currentRisks, resourceAssess);
        updateOrCreateCategoryRisk(project, currentRisks, safetyAssess);

        List<RiskDto> activeRisks = riskRepository.findByProjectId(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return RiskDto.RecalculateResponse.builder()
                .projectId(projectId)
                .overallScore(overallScore)
                .scheduleScore(scheduleScore)
                .resourceScore(resourceScore)
                .safetyScore(safetyScore)
                .severity(overallSeverity)
                .summary(summary)
                .activeRisks(activeRisks)
                .calculatedAt(LocalDateTime.now())
                .build();
    }

    private void updateOrCreateCategoryRisk(Project project, List<Risk> currentRisks, RiskCategoryAssessment assessment) {
        if (assessment == null) return;

        Risk risk = currentRisks.stream()
                .filter(r -> assessment.getCategory().equalsIgnoreCase(r.getCategory()))
                .findFirst()
                .orElse(null);

        ConstructionZone zone = null;
        if (assessment.getZoneId() != null) {
            zone = zoneRepository.findById(assessment.getZoneId()).orElse(null);
        }

        if (risk == null) {
            risk = Risk.builder()
                    .project(project)
                    .category(assessment.getCategory())
                    .title(assessment.getRiskTitle())
                    .description(assessment.getDynamicExplanation())
                    .riskScore(assessment.getScore())
                    .severity(assessment.getSeverity())
                    .contributingFactors(assessment.getContributingFactors())
                    .dynamicExplanation(assessment.getDynamicExplanation())
                    .recommendedAction(assessment.getRecommendedAction())
                    .status("IDENTIFIED")
                    .zone(zone)
                    .build();
        } else {
            risk.setRiskScore(assessment.getScore());
            risk.setSeverity(assessment.getSeverity());
            risk.setContributingFactors(assessment.getContributingFactors());
            risk.setDynamicExplanation(assessment.getDynamicExplanation());
            risk.setRecommendedAction(assessment.getRecommendedAction());
            if (zone != null) {
                risk.setZone(zone);
            }
        }
        riskRepository.save(risk);
    }

    public List<RiskDto> getProjectRisks(Long projectId) {
        return riskRepository.findByProjectId(projectId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<RiskDto.AssessmentHistoryDto> getRiskHistory(Long projectId) {
        return riskAssessmentRepository.findByProjectIdOrderByAssessedAtDesc(projectId).stream()
                .map(a -> RiskDto.AssessmentHistoryDto.builder()
                        .id(a.getId())
                        .projectId(a.getProject().getId())
                        .overallScore(a.getOverallScore())
                        .scheduleScore(a.getScheduleScore())
                        .resourceScore(a.getResourceScore())
                        .safetyScore(a.getSafetyScore())
                        .severity(a.getSeverity())
                        .summary(a.getSummary())
                        .assessedAt(a.getAssessedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String determineSeverity(BigDecimal score) {
        double val = score.doubleValue();
        if (val >= 75.0) return "CRITICAL";
        if (val >= 50.0) return "HIGH";
        if (val >= 25.0) return "MODERATE";
        return "LOW";
    }

    public RiskDto mapToDto(Risk risk) {
        return RiskDto.builder()
                .id(risk.getId())
                .projectId(risk.getProject().getId())
                .zoneId(risk.getZone() != null ? risk.getZone().getId() : null)
                .zoneName(risk.getZone() != null ? risk.getZone().getName() : "General Site")
                .category(risk.getCategory())
                .title(risk.getTitle())
                .description(risk.getDescription())
                .riskScore(risk.getRiskScore())
                .severity(risk.getSeverity())
                .contributingFactors(risk.getContributingFactors())
                .dynamicExplanation(risk.getDynamicExplanation())
                .recommendedAction(risk.getRecommendedAction())
                .status(risk.getStatus())
                .assignedTo(risk.getAssignedTo())
                .detectedAt(risk.getDetectedAt())
                .resolvedAt(risk.getResolvedAt())
                .build();
    }
}
