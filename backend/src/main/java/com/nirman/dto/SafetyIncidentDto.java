package com.nirman.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SafetyIncidentDto {
    private Long id;
    private String incidentCode;
    private Long projectId;
    private Long zoneId;
    private String zoneName;
    private String title;
    private String description;
    private String severity;
    private String status;
    private String reportedBy;
    private String assignedTo;
    private LocalDate incidentDate;
    private LocalDate targetResolutionDate;
    private String correctiveActions;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Incident title is required")
        private String title;
        private String description;
        private Long zoneId;
        private String severity = "MEDIUM";
        private String status = "OPEN";
        private String reportedBy;
        private String assignedTo;
        @NotNull(message = "Incident date is required")
        private LocalDate incidentDate;
        private LocalDate targetResolutionDate;
        private String correctiveActions;
    }
}
