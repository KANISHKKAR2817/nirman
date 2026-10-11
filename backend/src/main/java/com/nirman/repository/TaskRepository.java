package com.nirman.repository;

import com.nirman.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByProjectIdAndStatus(Long projectId, String status);
    List<Task> findByZoneId(Long zoneId);
    Optional<Task> findByProjectIdAndTaskCode(Long projectId, String taskCode);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'COMPLETED'")
    long countCompletedTasks(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'OVERDUE'")
    long countOverdueTasks(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'IN_PROGRESS'")
    long countInProgressTasks(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'BLOCKED'")
    long countBlockedTasks(@Param("projectId") Long projectId);
}
