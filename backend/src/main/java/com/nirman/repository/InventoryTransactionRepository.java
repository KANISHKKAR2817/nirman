package com.nirman.repository;

import com.nirman.entity.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByMaterialIdOrderByCreatedAtDesc(Long materialId);
    List<InventoryTransaction> findAllByOrderByCreatedAtDesc();
}
