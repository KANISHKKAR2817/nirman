package com.nirman.simulation;

import lombok.Builder;
import lombok.Data;

import java.util.*;

public class ScheduleDAG {

    @Data
    @Builder
    public static class Node {
        private Long taskId;
        private String taskCode;
        private String taskName;
        private int duration;
        private int earlyStart;
        private int earlyFinish;
        private int lateStart;
        private int lateFinish;
        private int totalSlack;
        private boolean isCritical;
        @Builder.Default
        private Set<Long> predecessors = new HashSet<>();
        @Builder.Default
        private Set<Long> successors = new HashSet<>();
    }

    private final Map<Long, Node> nodes = new HashMap<>();

    public void addNode(Long taskId, String taskCode, String taskName, int duration) {
        nodes.put(taskId, Node.builder()
                .taskId(taskId)
                .taskCode(taskCode)
                .taskName(taskName)
                .duration(Math.max(1, duration))
                .build());
    }

    public void addDependency(Long prerequisiteTaskId, Long taskId) {
        Node prereq = nodes.get(prerequisiteTaskId);
        Node target = nodes.get(taskId);
        if (prereq != null && target != null) {
            prereq.getSuccessors().add(taskId);
            target.getPredecessors().add(prerequisiteTaskId);
        }
    }

    public boolean hasCycle() {
        Map<Long, Integer> visited = new HashMap<>(); // 0: unvisited, 1: visiting, 2: visited
        for (Long id : nodes.keySet()) {
            if (visited.getOrDefault(id, 0) == 0) {
                if (dfsCycle(id, visited)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean dfsCycle(Long current, Map<Long, Integer> visited) {
        visited.put(current, 1);
        Node node = nodes.get(current);
        if (node != null) {
            for (Long succId : node.getSuccessors()) {
                int state = visited.getOrDefault(succId, 0);
                if (state == 1) return true; // back edge -> cycle detected
                if (state == 0 && dfsCycle(succId, visited)) return true;
            }
        }
        visited.put(current, 2);
        return false;
    }

    public List<Node> calculateCPM() {
        if (hasCycle()) {
            throw new IllegalStateException("Dependency cycle detected in project schedule graph");
        }

        // Topological Sort (Kahn's algorithm)
        Map<Long, Integer> inDegree = new HashMap<>();
        for (Long id : nodes.keySet()) {
            inDegree.put(id, nodes.get(id).getPredecessors().size());
        }

        Queue<Long> queue = new LinkedList<>();
        for (Map.Entry<Long, Integer> entry : inDegree.entrySet()) {
            if (entry.getValue() == 0) {
                queue.add(entry.getKey());
            }
        }

        List<Long> topoOrder = new ArrayList<>();
        while (!queue.isEmpty()) {
            Long curr = queue.poll();
            topoOrder.add(curr);
            Node currNode = nodes.get(curr);
            for (Long succId : currNode.getSuccessors()) {
                inDegree.put(succId, inDegree.get(succId) - 1);
                if (inDegree.get(succId) == 0) {
                    queue.add(succId);
                }
            }
        }

        // 1. Forward Pass: Calculate Early Start (ES) and Early Finish (EF)
        int projectDuration = 0;
        for (Long id : topoOrder) {
            Node node = nodes.get(id);
            int maxPredecessorEF = 0;
            for (Long predId : node.getPredecessors()) {
                Node pred = nodes.get(predId);
                if (pred.getEarlyFinish() > maxPredecessorEF) {
                    maxPredecessorEF = pred.getEarlyFinish();
                }
            }
            node.setEarlyStart(maxPredecessorEF);
            node.setEarlyFinish(node.getEarlyStart() + node.getDuration());
            if (node.getEarlyFinish() > projectDuration) {
                projectDuration = node.getEarlyFinish();
            }
        }

        // 2. Backward Pass: Calculate Late Finish (LF) and Late Start (LS)
        for (Long id : nodes.keySet()) {
            Node node = nodes.get(id);
            if (node.getSuccessors().isEmpty()) {
                node.setLateFinish(projectDuration);
                node.setLateStart(projectDuration - node.getDuration());
            } else {
                node.setLateFinish(Integer.MAX_VALUE);
            }
        }

        List<Long> reverseTopo = new ArrayList<>(topoOrder);
        Collections.reverse(reverseTopo);

        for (Long id : reverseTopo) {
            Node node = nodes.get(id);
            if (!node.getSuccessors().isEmpty()) {
                int minSuccessorLS = Integer.MAX_VALUE;
                for (Long succId : node.getSuccessors()) {
                    Node succ = nodes.get(succId);
                    if (succ.getLateStart() < minSuccessorLS) {
                        minSuccessorLS = succ.getLateStart();
                    }
                }
                node.setLateFinish(minSuccessorLS);
                node.setLateStart(node.getLateFinish() - node.getDuration());
            }

            // Total Float (Slack) = Late Start - Early Start
            int slack = node.getLateStart() - node.getEarlyStart();
            node.setTotalSlack(Math.max(0, slack));
            node.setCritical(node.getTotalSlack() == 0);
        }

        return new ArrayList<>(nodes.values());
    }

    public int getProjectDurationDays() {
        return nodes.values().stream()
                .mapToInt(Node::getEarlyFinish)
                .max()
                .orElse(0);
    }
}
