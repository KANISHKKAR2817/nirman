package com.nirman.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDto {
    private Long id;
    private Long projectId;
    private String actor;
    private String actionType;
    private String entityType;
    private Long entityId;
    private String changeSummary;
    private String ipAddress;
    private LocalDateTime createdAt;
}
