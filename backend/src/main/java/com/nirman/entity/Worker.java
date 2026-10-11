package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "worker_code", nullable = false, unique = true, length = 30)
    private String workerCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private ConstructionZone zone;

    @Column(nullable = false, length = 20)
    private String shift;

    @Column(length = 30)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(name = "skill_category", length = 50)
    private String skillCategory;

    @Column(name = "certification_status", length = 30)
    private String certificationStatus;

    @Column(name = "safety_training_status", length = 30)
    private String safetyTrainingStatus;

    @Column(nullable = false, length = 30)
    private String availability;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
