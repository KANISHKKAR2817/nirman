package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "site_address")
    private String siteAddress;

    @Column(length = 100)
    private String client;

    @Column(name = "project_manager", length = 100)
    private String projectManager;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "planned_completion_date", nullable = false)
    private LocalDate plannedCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Column(name = "total_budget", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalBudget;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "progress_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal progressPercentage;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
