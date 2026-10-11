package com.nirman.controller;

import com.nirman.dto.MaterialDto;
import com.nirman.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@Tag(name = "Materials & Inventory", description = "Endpoints for inventory management, stock deductions, and ledger tracking")
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    @Operation(summary = "List materials with live available quantities, thresholds, and valuation")
    public ResponseEntity<List<MaterialDto>> getMaterials(
            @RequestParam(required = false) Long storageZoneId
    ) {
        return ResponseEntity.ok(materialService.getAllMaterials(storageZoneId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get material by ID")
    public ResponseEntity<MaterialDto> getMaterialById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getMaterialById(id));
    }

    @PostMapping("/{id}/consume")
    @Operation(summary = "Safely consume material for a task with non-negative validation")
    public ResponseEntity<MaterialDto> consumeMaterial(
            @PathVariable Long id,
            @Valid @RequestBody MaterialDto.ConsumeRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(materialService.consumeMaterial(id, request, actor));
    }

    @PostMapping("/{id}/receive")
    @Operation(summary = "Record receipt of new inventory shipment")
    public ResponseEntity<MaterialDto> receiveMaterial(
            @PathVariable Long id,
            @Valid @RequestBody MaterialDto.ReceiveRequest request,
            Authentication authentication
    ) {
        String actor = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(materialService.receiveMaterial(id, request, actor));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get inventory transaction ledger history")
    public ResponseEntity<List<MaterialDto.TransactionDto>> getTransactions(
            @RequestParam(required = false) Long materialId
    ) {
        return ResponseEntity.ok(materialService.getTransactions(materialId));
    }
}
