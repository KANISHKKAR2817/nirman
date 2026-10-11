package com.nirman.service;

import com.nirman.dto.AuditLogDto;
import com.nirman.entity.AuditLog;
import com.nirman.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void record(Long projectId, String actor, String actionType, String entityType, Long entityId, String changeSummary, String ipAddress) {
        AuditLog log = AuditLog.builder()
                .projectId(projectId)
                .actor(actor != null ? actor : "system")
                .actionType(actionType)
                .entityType(entityType)
                .entityId(entityId)
                .changeSummary(changeSummary)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogDto> getAuditLogs(Long projectId) {
        List<AuditLog> logs = projectId != null
                ? auditLogRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                : auditLogRepository.findAllByOrderByCreatedAtDesc();

        return logs.stream()
                .map(l -> AuditLogDto.builder()
                        .id(l.getId())
                        .projectId(l.getProjectId())
                        .actor(l.getActor())
                        .actionType(l.getActionType())
                        .entityType(l.getEntityType())
                        .entityId(l.getEntityId())
                        .changeSummary(l.getChangeSummary())
                        .ipAddress(l.getIpAddress())
                        .createdAt(l.getCreatedAt() != null ? l.getCreatedAt() : LocalDateTime.now())
                        .build())
                .collect(Collectors.toList());
    }
}
