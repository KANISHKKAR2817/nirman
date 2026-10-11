package com.nirman.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private Long userId;
    private Long projectId;
    private String title;
    private String message;
    private String severity;
    private String category;
    private Boolean isRead;
    private String relatedEntityType;
    private Long relatedEntityId;
    private LocalDateTime createdAt;
}
