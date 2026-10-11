package com.nirman.repository;

import com.nirman.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Notification> findAllByOrderByCreatedAtDesc();
    long countByProjectIdAndIsReadFalse(Long projectId);
}
