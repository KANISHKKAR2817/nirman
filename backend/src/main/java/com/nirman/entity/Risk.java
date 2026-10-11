package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Risk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private ConstructionZone zone;

    @Column(nullable = false, length = 30)
    private String category; // SCHEDULE, RESOURCE, SAFETY

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(nullable = false, length = 20)
    private String severity; // LOW, MODERATE, HIGH, CRITICAL

    @Column(name = "contributing_factors", columnDefinition = "TEXT")
    private String contributingFactors;

    @Column(name = "dynamic_explanation", columnDefinition = "TEXT")
    private String dynamicExplanation;

    @Column(name = "recommended_action", columnDefinition = "TEXT")
    private String recommendedAction;

    @Column(nullable = false, length = 30)
    private String status; // IDENTIFIED, MITIGATING, RESOLVED, CLOSED

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "detected_at", insertable = false, updatable = false)
    private LocalDateTime detectedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
