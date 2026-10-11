package com.nirman.controller;

import com.nirman.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Exports", description = "Endpoints for tabular CSV and summary report exports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/export")
    @Operation(summary = "Export project data in CSV format (TASKS, INVENTORY, RISKS, SAFETY, BUDGET, SUMMARY)")
    public ResponseEntity<InputStreamResource> exportCsv(
            @RequestParam(defaultValue = "1") Long projectId,
            @RequestParam(defaultValue = "SUMMARY") String type
    ) {
        ByteArrayInputStream in = reportService.generateCsvReport(projectId, type);
        String filename = String.format("NIRMAN_%s_Report_%d.csv", type.toUpperCase(), System.currentTimeMillis());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(in));
    }
}
