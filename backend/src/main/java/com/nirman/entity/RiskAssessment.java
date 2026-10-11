package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "overall_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "schedule_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal scheduleScore;

    @Column(name = "resource_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal resourceScore;

    @Column(name = "safety_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal safetyScore;

    @Column(nullable = false, length = 20)
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "assessed_at", insertable = false, updatable = false)
    private LocalDateTime assessedAt;
}
