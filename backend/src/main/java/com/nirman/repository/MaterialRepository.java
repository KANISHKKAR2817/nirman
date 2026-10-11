package com.nirman.repository;

import com.nirman.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    Optional<Material> findByMaterialCode(String materialCode);
    List<Material> findByStorageZoneId(Long storageZoneId);

    @Query("SELECT m FROM Material m WHERE m.availableQuantity <= m.reorderThreshold")
    List<Material> findLowStockMaterials();
}
