package com.nirman.repository;

import com.nirman.entity.ConstructionZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConstructionZoneRepository extends JpaRepository<ConstructionZone, Long> {
    List<ConstructionZone> findByProjectId(Long projectId);
    Optional<ConstructionZone> findByProjectIdAndCode(Long projectId, String code);
}
