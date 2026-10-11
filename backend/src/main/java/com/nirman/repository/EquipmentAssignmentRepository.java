package com.nirman.repository;

import com.nirman.entity.EquipmentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentAssignmentRepository extends JpaRepository<EquipmentAssignment, Long> {
    List<EquipmentAssignment> findByTaskId(Long taskId);
    List<EquipmentAssignment> findByEquipmentId(Long equipmentId);
}
