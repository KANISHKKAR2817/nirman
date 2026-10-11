package com.nirman.service;

import com.nirman.dto.EquipmentDto;
import com.nirman.entity.*;
import com.nirman.exception.ResourceNotFoundException;
import com.nirman.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final ProjectRepository projectRepository;
    private final ConstructionZoneRepository zoneRepository;
    private final AuditLogService auditLogService;

    public List<EquipmentDto> getEquipment(Long projectId, String status, Long zoneId) {
        List<Equipment> list;
        if (zoneId != null) {
            list = equipmentRepository.findByZoneId(zoneId);
        } else if (status != null && !status.isEmpty()) {
            list = equipmentRepository.findByProjectIdAndOperationalStatus(projectId, status);
        } else {
            list = equipmentRepository.findByProjectId(projectId);
        }

        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EquipmentDto getEquipmentById(Long id) {
        Equipment e = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
        return mapToDto(e);
    }

    @Transactional
    public EquipmentDto updateStatus(Long id, String status, Long zoneId, String actor) {
        Equipment e = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));

        e.setOperationalStatus(status);
        if (zoneId != null) {
            ConstructionZone zone = zoneRepository.findById(zoneId).orElse(null);
            if (zone != null) {
                e.setZone(zone);
            }
        }
        Equipment saved = equipmentRepository.save(e);

        auditLogService.record(e.getProject().getId(), actor, "UPDATE_EQUIPMENT_STATUS", "EQUIPMENT", e.getId(),
                "Updated equipment " + e.getEquipmentCode() + " status to " + status, null);

        return mapToDto(saved);
    }

    private EquipmentDto mapToDto(Equipment e) {
        boolean overdue = e.getNextMaintenanceDate() != null && e.getNextMaintenanceDate().isBefore(LocalDate.now());

        return EquipmentDto.builder()
                .id(e.getId())
                .equipmentCode(e.getEquipmentCode())
                .name(e.getName())
                .category(e.getCategory())
                .projectId(e.getProject().getId())
                .zoneId(e.getZone() != null ? e.getZone().getId() : null)
                .zoneName(e.getZone() != null ? e.getZone().getName() : "Central Yard")
                .operationalStatus(e.getOperationalStatus())
                .utilizationPercentage(e.getUtilizationPercentage())
                .lastMaintenanceDate(e.getLastMaintenanceDate())
                .nextMaintenanceDate(e.getNextMaintenanceDate())
                .ownershipStatus(e.getOwnershipStatus())
                .operatingCostPerDay(e.getOperatingCostPerDay())
                .assignedOperator(e.getAssignedOperator())
                .maintenanceOverdue(overdue)
                .build();
    }
}
