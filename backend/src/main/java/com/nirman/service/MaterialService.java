package com.nirman.service;

import com.nirman.dto.MaterialDto;
import com.nirman.entity.*;
import com.nirman.exception.BusinessValidationException;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final ConstructionZoneRepository zoneRepository;
    private final TaskRepository taskRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public List<MaterialDto> getAllMaterials(Long storageZoneId) {
        List<Material> list = (storageZoneId != null)
                ? materialRepository.findByStorageZoneId(storageZoneId)
                : materialRepository.findAll();

        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MaterialDto getMaterialById(Long id) {
        Material m = materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));
        return mapToDto(m);
    }

    @Transactional
    public MaterialDto consumeMaterial(Long materialId, MaterialDto.ConsumeRequest request, String actor) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));

        BigDecimal consumeQty = request.getQuantity();
        if (consumeQty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Consumption quantity must be greater than zero.");
        }

        // Section 10 Rule: Never consume more than available unreserved quantity
        BigDecimal freeQty = material.getFreeQuantity();
        if (consumeQty.compareTo(freeQty) > 0) {
            throw new BusinessValidationException(String.format(
                    "Insufficient unreserved stock for %s. Requested: %.2f %s, Available Free: %.2f %s (Total Available: %.2f, Reserved: %.2f)",
                    material.getName(), consumeQty, material.getUnit(), freeQty, material.getUnit(),
                    material.getAvailableQuantity(), material.getReservedQuantity()
            ));
        }

        // Deduct from stock safely
        material.setAvailableQuantity(material.getAvailableQuantity().subtract(consumeQty));
        Material saved = materialRepository.save(material);

        Task refTask = null;
        if (request.getReferenceTaskId() != null) {
            refTask = taskRepository.findById(request.getReferenceTaskId()).orElse(null);
        }

        // Record stock movement transaction
        InventoryTransaction tx = InventoryTransaction.builder()
                .material(saved)
                .transactionType("CONSUMED")
                .quantity(consumeQty)
                .unitPrice(saved.getUnitPrice())
                .referenceTask(refTask)
                .notes(request.getNotes())
                .createdBy(actor != null ? actor : "system")
                .build();
        transactionRepository.save(tx);

        auditLogService.record(
                refTask != null ? refTask.getProject().getId() : 1L,
                actor, "CONSUME_MATERIAL", "MATERIAL", saved.getId(),
                String.format("Consumed %.2f %s of %s for task %s",
                        consumeQty, saved.getUnit(), saved.getName(),
                        refTask != null ? refTask.getTaskCode() : "General"),
                null
        );

        // Check low stock threshold alert
        if (saved.isLowStock()) {
            notificationService.createNotification(
                    1L,
                    "Low Stock Alert: " + saved.getName(),
                    String.format("%s inventory (%.2f %s) has reached or fallen below safety threshold (%.2f %s).",
                            saved.getName(), saved.getAvailableQuantity(), saved.getUnit(), saved.getReorderThreshold(), saved.getUnit()),
                    "WARNING", "MATERIAL", "MATERIAL", saved.getId()
            );
        }

        return mapToDto(saved);
    }

    @Transactional
    public MaterialDto receiveMaterial(Long materialId, MaterialDto.ReceiveRequest request, String actor) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));

        BigDecimal receiveQty = request.getQuantity();
        if (receiveQty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Received quantity must be greater than zero.");
        }

        material.setAvailableQuantity(material.getAvailableQuantity().add(receiveQty));
        if (request.getUnitPrice() != null && request.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
            material.setUnitPrice(request.getUnitPrice());
        }
        Material saved = materialRepository.save(material);

        InventoryTransaction tx = InventoryTransaction.builder()
                .material(saved)
                .transactionType("RECEIVED")
                .quantity(receiveQty)
                .unitPrice(saved.getUnitPrice())
                .notes(request.getNotes())
                .createdBy(actor != null ? actor : "system")
                .build();
        transactionRepository.save(tx);

        auditLogService.record(
                1L, actor, "RECEIVE_MATERIAL", "MATERIAL", saved.getId(),
                String.format("Received shipment of %.2f %s for %s", receiveQty, saved.getUnit(), saved.getName()),
                null
        );

        return mapToDto(saved);
    }

    public List<MaterialDto.TransactionDto> getTransactions(Long materialId) {
        List<InventoryTransaction> list = (materialId != null)
                ? transactionRepository.findByMaterialIdOrderByCreatedAtDesc(materialId)
                : transactionRepository.findAllByOrderByCreatedAtDesc();

        return list.stream()
                .map(tx -> MaterialDto.TransactionDto.builder()
                        .id(tx.getId())
                        .materialId(tx.getMaterial().getId())
                        .materialName(tx.getMaterial().getName())
                        .transactionType(tx.getTransactionType())
                        .quantity(tx.getQuantity())
                        .unitPrice(tx.getUnitPrice())
                        .referenceTaskId(tx.getReferenceTask() != null ? tx.getReferenceTask().getId() : null)
                        .referenceTaskCode(tx.getReferenceTask() != null ? tx.getReferenceTask().getTaskCode() : null)
                        .notes(tx.getNotes())
                        .createdBy(tx.getCreatedBy())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private MaterialDto mapToDto(Material m) {
        BigDecimal valuation = m.getAvailableQuantity().multiply(m.getUnitPrice());

        return MaterialDto.builder()
                .id(m.getId())
                .materialCode(m.getMaterialCode())
                .name(m.getName())
                .category(m.getCategory())
                .unit(m.getUnit())
                .availableQuantity(m.getAvailableQuantity())
                .reservedQuantity(m.getReservedQuantity())
                .freeQuantity(m.getFreeQuantity())
                .reorderThreshold(m.getReorderThreshold())
                .unitPrice(m.getUnitPrice())
                .stockValuation(valuation)
                .supplierName(m.getSupplierName())
                .storageZoneId(m.getStorageZone() != null ? m.getStorageZone().getId() : null)
                .storageZoneName(m.getStorageZone() != null ? m.getStorageZone().getName() : "Central Yard")
                .isLowStock(m.isLowStock())
                .lastUpdated(m.getLastUpdated())
                .build();
    }
}
