package com.nirman.repository;

import com.nirman.entity.SafetyIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SafetyIncidentRepository extends JpaRepository<SafetyIncident, Long> {
    List<SafetyIncident> findByProjectId(Long projectId);
    List<SafetyIncident> findByProjectIdAndStatus(Long projectId, String status);
    List<SafetyIncident> findByZoneId(Long zoneId);
    Optional<SafetyIncident> findByIncidentCode(String incidentCode);

    @Query("SELECT COUNT(i) FROM SafetyIncident i WHERE i.project.id = :projectId AND i.status IN ('OPEN', 'INVESTIGATING', 'ACTION_REQUIRED')")
    long countOpenIncidents(@Param("projectId") Long projectId);
}
