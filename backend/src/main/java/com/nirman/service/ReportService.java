package com.nirman.service;

import com.nirman.entity.*;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final MaterialRepository materialRepository;
    private final EquipmentRepository equipmentRepository;
    private final WorkerRepository workerRepository;
    private final SafetyIncidentRepository incidentRepository;
    private final RiskRepository riskRepository;
    private final BudgetEntryRepository budgetRepository;

    public ByteArrayInputStream generateCsvReport(Long projectId, String reportType) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            // Write UTF-8 BOM so Excel opens cleanly
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            if ("TASKS".equalsIgnoreCase(reportType)) {
                writeTasksCsv(writer, project);
            } else if ("INVENTORY".equalsIgnoreCase(reportType)) {
                writeMaterialsCsv(writer, project);
            } else if ("RISKS".equalsIgnoreCase(reportType)) {
                writeRisksCsv(writer, project);
            } else if ("SAFETY".equalsIgnoreCase(reportType)) {
                writeSafetyCsv(writer, project);
            } else if ("BUDGET".equalsIgnoreCase(reportType)) {
                writeBudgetCsv(writer, project);
            } else {
                writeProjectSummaryCsv(writer, project);
            }
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV export", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void writeTasksCsv(PrintWriter writer, Project project) {
        writer.println("Task Code,Task Name,Zone,Assigned Team,Start Date,Due Date,Duration (Days),Progress %,Status,Priority,Estimated Cost (INR),Actual Cost (INR)");
        List<Task> tasks = taskRepository.findByProjectId(project.getId());
        for (Task t : tasks) {
            writer.printf("%s,%s,%s,%s,%s,%s,%d,%.2f,%s,%s,%.2f,%.2f%n",
                    escapeCsv(t.getTaskCode()),
                    escapeCsv(t.getName()),
                    escapeCsv(t.getZone() != null ? t.getZone().getName() : "N/A"),
                    escapeCsv(t.getAssignedTeam()),
                    t.getStartDate(),
                    t.getDueDate(),
                    t.getEstimatedDurationDays(),
                    t.getProgressPercentage(),
                    escapeCsv(t.getStatus()),
                    escapeCsv(t.getPriority()),
                    t.getEstimatedCost(),
                    t.getActualCost()
            );
        }
    }

    private void writeMaterialsCsv(PrintWriter writer, Project project) {
        writer.println("Material Code,Name,Category,Unit,Available Qty,Reserved Qty,Safety Threshold,Unit Price (INR),Valuation (INR),Supplier,Storage Zone,Low Stock Alert");
        List<Material> materials = materialRepository.findAll();
        for (Material m : materials) {
            writer.printf("%s,%s,%s,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%s,%s,%s%n",
                    escapeCsv(m.getMaterialCode()),
                    escapeCsv(m.getName()),
                    escapeCsv(m.getCategory()),
                    escapeCsv(m.getUnit()),
                    m.getAvailableQuantity(),
                    m.getReservedQuantity(),
                    m.getReorderThreshold(),
                    m.getUnitPrice(),
                    m.getAvailableQuantity().multiply(m.getUnitPrice()),
                    escapeCsv(m.getSupplierName()),
                    escapeCsv(m.getStorageZone() != null ? m.getStorageZone().getName() : "Central Yard"),
                    m.isLowStock() ? "YES" : "NO"
            );
        }
    }

    private void writeRisksCsv(PrintWriter writer, Project project) {
        writer.println("Risk Category,Risk Title,Risk Score,Severity,Contributing Factors,Dynamic Explanation,Recommended Action,Status,Assigned To");
        List<Risk> risks = riskRepository.findByProjectId(project.getId());
        for (Risk r : risks) {
            writer.printf("%s,%s,%.2f,%s,%s,%s,%s,%s,%s%n",
                    escapeCsv(r.getCategory()),
                    escapeCsv(r.getTitle()),
                    r.getRiskScore(),
                    escapeCsv(r.getSeverity()),
                    escapeCsv(r.getContributingFactors()),
                    escapeCsv(r.getDynamicExplanation()),
                    escapeCsv(r.getRecommendedAction()),
                    escapeCsv(r.getStatus()),
                    escapeCsv(r.getAssignedTo() != null ? r.getAssignedTo() : "Unassigned")
            );
        }
    }

    private void writeSafetyCsv(PrintWriter writer, Project project) {
        writer.println("Incident Code,Title,Severity,Status,Zone,Reported By,Assigned To,Incident Date,Target Resolution Date,Corrective Actions");
        List<SafetyIncident> list = incidentRepository.findByProjectId(project.getId());
        for (SafetyIncident i : list) {
            writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                    escapeCsv(i.getIncidentCode()),
                    escapeCsv(i.getTitle()),
                    escapeCsv(i.getSeverity()),
                    escapeCsv(i.getStatus()),
                    escapeCsv(i.getZone() != null ? i.getZone().getName() : "Site"),
                    escapeCsv(i.getReportedBy()),
                    escapeCsv(i.getAssignedTo()),
                    i.getIncidentDate(),
                    i.getTargetResolutionDate() != null ? i.getTargetResolutionDate() : "N/A",
                    escapeCsv(i.getCorrectiveActions())
            );
        }
    }

    private void writeBudgetCsv(PrintWriter writer, Project project) {
        writer.println("Category,Planned Amount (INR),Committed Amount (INR),Actual Expenditure (INR),Variance (INR),Period,Fiscal Year,Notes");
        List<BudgetEntry> list = budgetRepository.findByProjectId(project.getId());
        for (BudgetEntry b : list) {
            writer.printf("%s,%.2f,%.2f,%.2f,%.2f,%s,%d,%s%n",
                    escapeCsv(b.getCategory()),
                    b.getPlannedAmount(),
                    b.getCommittedAmount(),
                    b.getActualExpenditure(),
                    b.getPlannedAmount().subtract(b.getActualExpenditure()),
                    escapeCsv(b.getPeriodMonth()),
                    b.getFiscalYear() != null ? b.getFiscalYear() : 2026,
                    escapeCsv(b.getNotes())
            );
        }
    }

    private void writeProjectSummaryCsv(PrintWriter writer, Project project) {
        writer.println("NIRMAN Construction Project Executive Summary");
        writer.printf("Project Name,%s%n", escapeCsv(project.getName()));
        writer.printf("Project Code,%s%n", escapeCsv(project.getCode()));
        writer.printf("Client,%s%n", escapeCsv(project.getClient()));
        writer.printf("Project Manager,%s%n", escapeCsv(project.getProjectManager()));
        writer.printf("Start Date,%s%n", project.getStartDate());
        writer.printf("Planned Handover,%s%n", project.getPlannedCompletionDate());
        writer.printf("Overall Progress,%.2f%%%n", project.getProgressPercentage());
        writer.printf("Approved Budget,INR %.2f%n", project.getTotalBudget());
        writer.printf("Status,%s%n", project.getStatus());
    }

    /**
     * Section 15 CSV formula injection security mitigation:
     * Disarms formula prefixes (=, +, -, @) with prepended single quote and wraps in quotes.
     */
    private String escapeCsv(String value) {
        if (value == null) return "\"\"";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.startsWith("=") || escaped.startsWith("+") || escaped.startsWith("-") || escaped.startsWith("@")) {
            escaped = "'" + escaped;
        }
        return "\"" + escaped + "\"";
    }
}
