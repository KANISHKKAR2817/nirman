package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "simulation_scenario_changes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationScenarioChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_id", nullable = false)
    private SimulationScenario scenario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "parameter_name", nullable = false, length = 50)
    private String parameterName;

    @Column(name = "original_value", nullable = false, length = 100)
    private String originalValue;

    @Column(name = "simulated_value", nullable = false, length = 100)
    private String simulatedValue;

    @Column(columnDefinition = "TEXT")
    private String rationale;
}
