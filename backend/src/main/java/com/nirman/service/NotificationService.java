package com.nirman.service;

import com.nirman.dto.NotificationDto;
import com.nirman.entity.Notification;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.NotificationRepository;
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
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<NotificationDto> getNotifications(Long projectId) {
        List<Notification> list = (projectId != null)
                ? notificationRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                : notificationRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long projectId) {
        return projectId != null
                ? notificationRepository.countByProjectIdAndIsReadFalse(projectId)
                : notificationRepository.findAll().stream().filter(n -> Boolean.FALSE.equals(n.getIsRead())).count();
    }

    @Transactional
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setIsRead(true);
        return mapToDto(notificationRepository.save(notification));
    }

    @Transactional
    public void markAllAsRead(Long projectId) {
        List<Notification> list = (projectId != null)
                ? notificationRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                : notificationRepository.findAll();
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }

    @Transactional
    public void createNotification(Long projectId, String title, String message, String severity, String category, String entityType, Long entityId) {
        Notification n = Notification.builder()
                .projectId(projectId)
                .title(title)
                .message(message)
                .severity(severity)
                .category(category)
                .isRead(false)
                .relatedEntityType(entityType)
                .relatedEntityId(entityId)
                .build();
        notificationRepository.save(n);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .userId(n.getUserId())
                .projectId(n.getProjectId())
                .title(n.getTitle())
                .message(n.getMessage())
                .severity(n.getSeverity())
                .category(n.getCategory())
                .isRead(n.getIsRead())
                .relatedEntityType(n.getRelatedEntityType())
                .relatedEntityId(n.getRelatedEntityId())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
