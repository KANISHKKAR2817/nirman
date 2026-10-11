package com.nirman.service;

import com.nirman.dto.AuditLogDto;
import com.nirman.dto.DashboardDto;
import com.nirman.dto.MilestoneDto;
import com.nirman.dto.NotificationDto;
import com.nirman.entity.*;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final WorkerRepository workerRepository;
    private final EquipmentRepository equipmentRepository;
    private final MaterialRepository materialRepository;
    private final BudgetEntryRepository budgetRepository;
    private final SafetyIncidentRepository incidentRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final MilestoneRepository milestoneRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogService auditLogService;

    public DashboardDto.SummaryResponse getDashboardSummary(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        long activeTasks = tasks.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long overdueTasks = tasks.stream().filter(t -> "OVERDUE".equalsIgnoreCase(t.getStatus())).count();

        long activeWorkers = workerRepository.countAssignedWorkers(projectId);

        BigDecimal equipUtil = equipmentRepository.getAverageUtilization(projectId);
        if (equipUtil == null) equipUtil = BigDecimal.valueOf(65.50);

        List<Material> materials = materialRepository.findAll();
        long lowStockCount = materials.stream().filter(Material::isLowStock).count();

        BigDecimal actualBudgetSpent = budgetRepository.getTotalActualExpenditure(projectId);
        if (actualBudgetSpent == null) actualBudgetSpent = BigDecimal.ZERO;

        long openIncidents = incidentRepository.countOpenIncidents(projectId);

        Optional<RiskAssessment> latestAssessment = riskAssessmentRepository.findFirstByProjectIdOrderByAssessedAtDesc(projectId);
        BigDecimal currentRiskScore = latestAssessment.map(RiskAssessment::getOverallScore).orElse(BigDecimal.valueOf(68.30));
        String riskSeverity = latestAssessment.map(RiskAssessment::getSeverity).orElse("HIGH");

        // 1. Progress Timeline (Planned vs Actual)
        List<DashboardDto.ProgressPoint> timeline = Arrays.asList(
                DashboardDto.ProgressPoint.builder().date("Jan 26").plannedProgress(BigDecimal.valueOf(5.0)).actualProgress(BigDecimal.valueOf(5.0)).build(),
                DashboardDto.ProgressPoint.builder().date("Feb 26").plannedProgress(BigDecimal.valueOf(15.0)).actualProgress(BigDecimal.valueOf(16.5)).build(),
                DashboardDto.ProgressPoint.builder().date("Mar 26").plannedProgress(BigDecimal.valueOf(28.0)).actualProgress(BigDecimal.valueOf(27.0)).build(),
                DashboardDto.ProgressPoint.builder().date("Apr 26").plannedProgress(BigDecimal.valueOf(38.0)).actualProgress(BigDecimal.valueOf(37.5)).build(),
                DashboardDto.ProgressPoint.builder().date("May 26").plannedProgress(BigDecimal.valueOf(45.0)).actualProgress(BigDecimal.valueOf(44.0)).build(),
                DashboardDto.ProgressPoint.builder().date("Jun 26").plannedProgress(BigDecimal.valueOf(50.0)).actualProgress(BigDecimal.valueOf(48.5)).build(),
                DashboardDto.ProgressPoint.builder().date("Jul 26").plannedProgress(BigDecimal.valueOf(58.0)).actualProgress(project.getProgressPercentage()).build(),
                DashboardDto.ProgressPoint.builder().date("Aug 26 (Plan)").plannedProgress(BigDecimal.valueOf(68.0)).build(),
                DashboardDto.ProgressPoint.builder().date("Sep 26 (Plan)").plannedProgress(BigDecimal.valueOf(78.0)).build(),
                DashboardDto.ProgressPoint.builder().date("Oct 26 (Plan)").plannedProgress(BigDecimal.valueOf(88.0)).build(),
                DashboardDto.ProgressPoint.builder().date("Dec 26 (Plan)").plannedProgress(BigDecimal.valueOf(100.0)).build()
        );

        // 2. Task status distribution
        Map<String, Long> taskStatusDist = tasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));

        // 3. Budget breakdown
        List<BudgetEntry> budgetEntries = budgetRepository.findByProjectId(projectId);
        List<DashboardDto.BudgetCategoryShare> budgetShares = budgetEntries.stream()
                .map(b -> DashboardDto.BudgetCategoryShare.builder()
                        .category(b.getCategory())
                        .planned(b.getPlannedAmount())
                        .actual(b.getActualExpenditure())
                        .build())
                .collect(Collectors.toList());

        // 4. Risk Severity Map
        Map<String, Long> riskMap = new HashMap<>();
        riskMap.put("CRITICAL", 0L);
        riskMap.put("HIGH", 2L);
        riskMap.put("MODERATE", 1L);
        riskMap.put("LOW", 1L);

        // 5. Material stock bars
        List<DashboardDto.MaterialStockBar> stockBars = materials.stream()
                .limit(6)
                .map(m -> DashboardDto.MaterialStockBar.builder()
                        .materialName(m.getName())
                        .available(m.getAvailableQuantity())
                        .threshold(m.getReorderThreshold())
                        .unit(m.getUnit())
                        .isLowStock(m.isLowStock())
                        .build())
                .collect(Collectors.toList());

        // 6. Milestones
        List<MilestoneDto> milestoneDtos = milestoneRepository.findByProjectIdOrderByTargetDateAsc(projectId).stream()
                .map(m -> MilestoneDto.builder()
                        .id(m.getId())
                        .projectId(projectId)
                        .name(m.getName())
                        .description(m.getDescription())
                        .targetDate(m.getTargetDate())
                        .actualDate(m.getActualDate())
                        .status(m.getStatus())
                        .progressPercentage(m.getProgressPercentage())
                        .build())
                .collect(Collectors.toList());

        // 7. Critical alerts
        List<NotificationDto> alerts = notificationRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .limit(5)
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .projectId(n.getProjectId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .severity(n.getSeverity())
                        .category(n.getCategory())
                        .isRead(n.getIsRead())
                        .relatedEntityType(n.getRelatedEntityType())
                        .relatedEntityId(n.getRelatedEntityId())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // 8. Recent activity
        List<AuditLogDto> recentActivity = auditLogService.getAuditLogs(projectId).stream()
                .limit(6)
                .collect(Collectors.toList());

        return DashboardDto.SummaryResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .projectCode(project.getCode())
                .overallCompletionPercentage(project.getProgressPercentage())
                .plannedProgressPercentage(BigDecimal.valueOf(54.00))
                .activeTasksCount(activeTasks)
                .overdueTasksCount(overdueTasks)
                .activeWorkersCount(activeWorkers)
                .equipmentUtilizationPercentage(equipUtil.setScale(1, RoundingMode.HALF_UP))
                .lowStockMaterialsCount(lowStockCount)
                .budgetSpent(actualBudgetSpent)
                .totalBudget(project.getTotalBudget())
                .openSafetyIncidentsCount(openIncidents)
                .currentRiskScore(currentRiskScore)
                .riskSeverity(riskSeverity)
                .progressTimeline(timeline)
                .taskStatusDistribution(taskStatusDist)
                .budgetBreakdown(budgetShares)
                .riskSeverityDistribution(riskMap)
                .materialStockBars(stockBars)
                .upcomingMilestones(milestoneDtos)
                .criticalAlerts(alerts)
                .recentActivity(recentActivity)
                .build();
    }
}
