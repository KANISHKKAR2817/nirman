package com.nirman.repository;

import com.nirman.entity.BudgetEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BudgetEntryRepository extends JpaRepository<BudgetEntry, Long> {
    List<BudgetEntry> findByProjectId(Long projectId);

    @Query("SELECT SUM(b.actualExpenditure) FROM BudgetEntry b WHERE b.project.id = :projectId")
    BigDecimal getTotalActualExpenditure(@Param("projectId") Long projectId);

    @Query("SELECT SUM(b.committedAmount) FROM BudgetEntry b WHERE b.project.id = :projectId")
    BigDecimal getTotalCommittedAmount(@Param("projectId") Long projectId);

    @Query("SELECT SUM(b.plannedAmount) FROM BudgetEntry b WHERE b.project.id = :projectId")
    BigDecimal getTotalPlannedAmount(@Param("projectId") Long projectId);
}
