package com.nirman.repository;

import com.nirman.entity.WorkerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkerAssignmentRepository extends JpaRepository<WorkerAssignment, Long> {
    List<WorkerAssignment> findByTaskId(Long taskId);
    List<WorkerAssignment> findByWorkerId(Long workerId);
}
