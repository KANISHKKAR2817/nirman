package com.nirman.service;

import com.nirman.dto.BudgetDto;
import com.nirman.entity.BudgetEntry;
import com.nirman.entity.Project;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.BudgetEntryRepository;
import com.nirman.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BudgetService {

    private final BudgetEntryRepository budgetRepository;
    private final ProjectRepository projectRepository;

    public BudgetDto.SummaryDto getBudgetSummary(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<BudgetEntry> entries = budgetRepository.findByProjectId(projectId);
        BigDecimal totalBudget = project.getTotalBudget() != null ? project.getTotalBudget() : BigDecimal.ZERO;

        BigDecimal totalPlanned = entries.stream()
                .map(BudgetEntry::getPlannedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCommitted = entries.stream()
                .map(BudgetEntry::getCommittedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalActual = entries.stream()
                .map(BudgetEntry::getActualExpenditure)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Section 14 Calculations:
        // Budget Variance = Approved Budget - Actual Expenditure
        BigDecimal budgetVariance = totalBudget.subtract(totalActual);

        // Remaining Budget = Approved Budget - Actual Expenditure - Committed Amount
        BigDecimal remainingBudget = totalBudget.subtract(totalActual).subtract(totalCommitted);

        // Budget Utilization (%) = Actual Expenditure / Approved Budget * 100 (Safe division)
        BigDecimal utilizationPercentage = BigDecimal.ZERO;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            utilizationPercentage = totalActual
                    .multiply(BigDecimal.valueOf(100))
                    .divide(totalBudget, 2, RoundingMode.HALF_UP);
        }

        // Estimated Cost at Completion (EAC):
        // EAC = Actual Expenditure + (Planned - Actual) / CPI where CPI = EV/AC
        // Using standard earned value: if progress > 0, EAC = (Budget * (Actual / (Budget * Progress%)))
        BigDecimal progressFraction = project.getProgressPercentage().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal estimatedCostAtCompletion = totalBudget;
        if (progressFraction.compareTo(BigDecimal.ZERO) > 0 && totalActual.compareTo(BigDecimal.ZERO) > 0) {
            estimatedCostAtCompletion = totalActual.divide(progressFraction, 2, RoundingMode.HALF_UP);
        }

        List<BudgetDto.EntryDto> categoryDtos = entries.stream()
                .map(e -> BudgetDto.EntryDto.builder()
                        .id(e.getId())
                        .projectId(e.getProject().getId())
                        .category(e.getCategory())
                        .plannedAmount(e.getPlannedAmount())
                        .committedAmount(e.getCommittedAmount())
                        .actualExpenditure(e.getActualExpenditure())
                        .variance(e.getPlannedAmount().subtract(e.getActualExpenditure()))
                        .periodMonth(e.getPeriodMonth())
                        .fiscalYear(e.getFiscalYear())
                        .notes(e.getNotes())
                        .build())
                .collect(Collectors.toList());

        return BudgetDto.SummaryDto.builder()
                .projectId(projectId)
                .totalBudget(totalBudget)
                .plannedBudget(totalPlanned)
                .committedBudget(totalCommitted)
                .actualExpenditure(totalActual)
                .remainingBudget(remainingBudget)
                .budgetVariance(budgetVariance)
                .utilizationPercentage(utilizationPercentage)
                .estimatedCostAtCompletion(estimatedCostAtCompletion)
                .categoryEntries(categoryDtos)
                .build();
    }
}
