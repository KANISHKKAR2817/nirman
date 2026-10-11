package com.nirman.repository;

import com.nirman.entity.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Long> {
    List<Risk> findByProjectId(Long projectId);
    List<Risk> findByProjectIdAndCategory(Long projectId, String category);
    List<Risk> findByZoneId(Long zoneId);
}
