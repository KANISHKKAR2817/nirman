package com.nirman;

import com.nirman.entity.Task;
import com.nirman.risk.RiskModels;
import com.nirman.risk.ScheduleRiskStrategy;
import com.nirman.simulation.ScheduleDAG;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class NirmanCoreLogicTest {

    @Test
    void testPrintBcrypt() {
        String hash = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("password123");
        System.out.println("GENERATED_BCRYPT_HASH: " + hash);
        assertTrue(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().matches("password123", hash));
    }

    @Test
    @DisplayName("CPM Algorithm accurately identifies critical path and slack")
    void testCriticalPathCalculation() {
        ScheduleDAG dag = new ScheduleDAG();
        // Task 1: 5 days -> Task 2: 10 days -> Task 3: 5 days (Critical path total = 20 days)
        // Task 4: 3 days (parallel to Task 2, has slack)
        dag.addNode(1L, "TSK-01", "Excavation", 5);
        dag.addNode(2L, "TSK-02", "Rebar", 10);
        dag.addNode(3L, "TSK-03", "Concreting", 5);
        dag.addNode(4L, "TSK-04", "Site Cabling", 3);

        dag.addDependency(1L, 2L);
        dag.addDependency(2L, 3L);
        dag.addDependency(1L, 4L);
        dag.addDependency(4L, 3L);

        assertFalse(dag.hasCycle(), "DAG should not have cycles");

        List<ScheduleDAG.Node> nodes = dag.calculateCPM();
        assertEquals(20, dag.getProjectDurationDays(), "Project duration should be 20 days");

        ScheduleDAG.Node node4 = nodes.stream().filter(n -> n.getTaskId() == 4L).findFirst().orElseThrow();
        assertEquals(7, node4.getTotalSlack(), "Task 4 should have 7 days of total slack");
        assertFalse(node4.isCritical(), "Task 4 should not be on critical path");

        ScheduleDAG.Node node2 = nodes.stream().filter(n -> n.getTaskId() == 2L).findFirst().orElseThrow();
        assertEquals(0, node2.getTotalSlack(), "Task 2 should have 0 slack");
        assertTrue(node2.isCritical(), "Task 2 should be on critical path");
    }

    @Test
    @DisplayName("Cycle detection catches circular schedule dependencies")
    void testCycleDetection() {
        ScheduleDAG dag = new ScheduleDAG();
        dag.addNode(1L, "TSK-01", "Task 1", 5);
        dag.addNode(2L, "TSK-02", "Task 2", 5);
        dag.addDependency(1L, 2L);
        dag.addDependency(2L, 1L); // Cycle!

        assertTrue(dag.hasCycle(), "Cycle should be detected");
    }

    @Test
    @DisplayName("Schedule risk strategy calculates elevated score for overdue tasks")
    void testScheduleRiskStrategy() {
        ScheduleRiskStrategy strategy = new ScheduleRiskStrategy();

        Task t1 = Task.builder()
                .id(1L)
                .taskCode("TSK-01")
                .name("Slab Casting")
                .dueDate(LocalDate.now().minusDays(5))
                .status("OVERDUE")
                .progressPercentage(BigDecimal.valueOf(40.0))
                .build();

        Task t2 = Task.builder()
                .id(2L)
                .taskCode("TSK-02")
                .name("Columns")
                .dueDate(LocalDate.now().plusDays(10))
                .status("IN_PROGRESS")
                .progressPercentage(BigDecimal.valueOf(60.0))
                .build();

        RiskModels.RiskScoringContext context = RiskModels.RiskScoringContext.builder()
                .tasks(Arrays.asList(t1, t2))
                .build();

        RiskModels.RiskCategoryAssessment result = strategy.evaluate(context);
        assertNotNull(result);
        assertEquals("SCHEDULE", result.getCategory());
        assertTrue(result.getScore().compareTo(BigDecimal.valueOf(50.0)) >= 0, "Score should be elevated due to 50% overdue tasks");
        assertTrue(result.getDynamicExplanation().contains("Schedule Delay Risk"));
    }
}
