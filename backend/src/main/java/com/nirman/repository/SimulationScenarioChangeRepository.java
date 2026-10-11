package com.nirman.repository;

import com.nirman.entity.SimulationScenarioChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SimulationScenarioChangeRepository extends JpaRepository<SimulationScenarioChange, Long> {
    List<SimulationScenarioChange> findByScenarioId(Long scenarioId);
}
