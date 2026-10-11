package com.nirman.controller;

import com.nirman.dto.SimulationDto;
import com.nirman.entity.Project;
import com.nirman.entity.SimulationScenario;
import com.nirman.simulation.ScheduleSimulationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/simulations")
@RequiredArgsConstructor
@Tag(name = "Schedule Simulator", description = "Endpoints for CPM What-If scenario simulations without altering baseline")
public class SimulationController {

    private final ScheduleSimulationService simulationService;

    @PostMapping("/run")
    @Operation(summary = "Run isolated What-If scenario simulation on CPM DAG")
    public ResponseEntity<SimulationDto.SimulationResult> runSimulation(
            @RequestBody SimulationDto.RunRequest request
    ) {
        return ResponseEntity.ok(simulationService.runWhatIfSimulation(request));
    }

    @PostMapping("/save")
    @Operation(summary = "Save simulated scenario for comparative record keeping")
    public ResponseEntity<SimulationScenario> saveScenario(
            @RequestBody SimulationDto.RunRequest request
    ) {
        SimulationDto.SimulationResult result = simulationService.runWhatIfSimulation(request);
        return ResponseEntity.ok(simulationService.saveScenario(request, result));
    }

    @PostMapping("/{id}/apply")
    @Operation(summary = "Explicitly apply simulated scenario changes to live project schedule")
    public ResponseEntity<Project> applyScenario(@PathVariable Long id) {
        return ResponseEntity.ok(simulationService.applyScenario(id));
    }

    @GetMapping
    @Operation(summary = "List saved simulation scenarios for project")
    public ResponseEntity<List<SimulationScenario>> getScenarios(
            @RequestParam(defaultValue = "1") Long projectId
    ) {
        return ResponseEntity.ok(simulationService.getScenarios(projectId));
    }
}
