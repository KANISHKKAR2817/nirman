package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_scenarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimulationScenario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "baseline_completion_date", nullable = false)
    private LocalDate baselineCompletionDate;

    @Column(name = "projected_completion_date", nullable = false)
    private LocalDate projectedCompletionDate;

    @Column(name = "delay_days", nullable = false)
    private Integer delayDays;

    @Column(name = "cost_delta", nullable = false, precision = 15, scale = 2)
    private BigDecimal costDelta;

    @Column(name = "baseline_risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal baselineRiskScore;

    @Column(name = "projected_risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal projectedRiskScore;

    @Column(name = "is_applied")
    private Boolean isApplied;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
