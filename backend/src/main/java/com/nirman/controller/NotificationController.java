package com.nirman.controller;

import com.nirman.dto.NotificationDto;
import com.nirman.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints for alert feeds, unread tracking, and status acknowledgment")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "List project notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications(
            @RequestParam(defaultValue = "1") Long projectId
    ) {
        return ResponseEntity.ok(notificationService.getNotifications(projectId));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestParam(defaultValue = "1") Long projectId
    ) {
        long count = notificationService.getUnreadCount(projectId);
        return ResponseEntity.ok(Collections.singletonMap("unreadCount", count));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PostMapping("/mark-all-read")
    @Operation(summary = "Mark all project notifications as read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam(defaultValue = "1") Long projectId) {
        notificationService.markAllAsRead(projectId);
        return ResponseEntity.ok().build();
    }
}
