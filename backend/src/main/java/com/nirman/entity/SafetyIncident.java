package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "safety_incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafetyIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_code", nullable = false, unique = true, length = 30)
    private String incidentCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private ConstructionZone zone;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false, length = 30)
    private String status; // OPEN, INVESTIGATING, ACTION_REQUIRED, RESOLVED, CLOSED

    @Column(name = "reported_by", length = 100)
    private String reportedBy;

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "target_resolution_date")
    private LocalDate targetResolutionDate;

    @Column(name = "corrective_actions", columnDefinition = "TEXT")
    private String correctiveActions;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
