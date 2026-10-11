package com.nirman.repository;

import com.nirman.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByProjectId(Long projectId);
    List<Equipment> findByProjectIdAndOperationalStatus(Long projectId, String status);
    List<Equipment> findByZoneId(Long zoneId);
    Optional<Equipment> findByEquipmentCode(String equipmentCode);

    @Query("SELECT AVG(e.utilizationPercentage) FROM Equipment e WHERE e.project.id = :projectId")
    BigDecimal getAverageUtilization(@Param("projectId") Long projectId);
}
