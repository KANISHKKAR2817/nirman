package com.nirman.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "planned_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal plannedAmount;

    @Column(name = "committed_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal committedAmount;

    @Column(name = "actual_expenditure", nullable = false, precision = 15, scale = 2)
    private BigDecimal actualExpenditure;

    @Column(name = "period_month", length = 20)
    private String periodMonth;

    @Column(name = "fiscal_year")
    private Integer fiscalYear;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
