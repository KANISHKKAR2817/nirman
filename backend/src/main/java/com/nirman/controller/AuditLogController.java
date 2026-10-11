package com.nirman.controller;

import com.nirman.dto.AuditLogDto;
import com.nirman.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Trail", description = "Endpoints for immutable activity logs and operational change records")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "List audit log change events")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) Long projectId
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(projectId));
    }
}
