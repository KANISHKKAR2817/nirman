package com.nirman.repository;

import com.nirman.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerRepository extends JpaRepository<Worker, Long> {
    List<Worker> findByProjectId(Long projectId);
    List<Worker> findByProjectIdAndAvailability(Long projectId, String availability);
    List<Worker> findByZoneId(Long zoneId);
    Optional<Worker> findByWorkerCode(String workerCode);

    @Query("SELECT COUNT(w) FROM Worker w WHERE w.project.id = :projectId AND w.availability = 'AVAILABLE'")
    long countAvailableWorkers(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(w) FROM Worker w WHERE w.project.id = :projectId AND w.availability = 'ASSIGNED'")
    long countAssignedWorkers(@Param("projectId") Long projectId);
}
