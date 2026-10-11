package com.nirman.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneDto {
    private Long id;
    private Long projectId;
    private String code;
    private String name;
    private String zoneType;
    private Integer floorLevel;
    private BigDecimal areaSqm;
    private String status;
    private String riskLevel;
    private BigDecimal progressPercentage;
    private String boundingBoxJson;
}
