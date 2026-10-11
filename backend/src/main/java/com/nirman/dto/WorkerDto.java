package com.nirman.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkerDto {
    private Long id;
    private String workerCode;
    private String name;
    private String role;
    private Long projectId;
    private Long zoneId;
    private String zoneName;
    private String shift;
    private String phone;
    private String email;
    private String skillCategory;
    private String certificationStatus;
    private String safetyTrainingStatus;
    private String availability;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUpdateRequest {
        @NotBlank(message = "Worker code is required")
        private String workerCode;
        @NotBlank(message = "Name is required")
        private String name;
        @NotBlank(message = "Role is required")
        private String role;
        private Long zoneId;
        private String shift = "DAY";
        private String phone;
        private String email;
        private String skillCategory;
        private String certificationStatus = "ACTIVE";
        private String safetyTrainingStatus = "CERTIFIED";
        private String availability = "AVAILABLE";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentRequest {
        private Long workerId;
        private Long taskId;
        private LocalDate assignedDate;
        private String roleInTask;
    }
}
