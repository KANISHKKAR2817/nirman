// NIRMAN Domain TypeScript Types

export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'SITE_ENGINEER' | 'SAFETY_OFFICER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
}

export interface AuthDto {
  token: string;
  type?: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  description?: string;
  siteAddress?: string;
  client?: string;
  projectManager?: string;
  startDate: string;
  plannedCompletionDate: string;
  actualCompletionDate?: string;
  totalBudget: number;
  status: string;
  progressPercentage: number;
  createdAt?: string;
}

export interface ConstructionZone {
  id: number;
  projectId: number;
  code: string;
  name: string;
  zoneType: string;
  floorLevel: number;
  areaSqm: number;
  status: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  progressPercentage: number;
  boundingBoxJson?: string;
}

export interface Task {
  id: number;
  taskCode: string;
  name: string;
  description?: string;
  projectId: number;
  zoneId?: number;
  zoneName?: string;
  assignedTeam?: string;
  startDate: string;
  dueDate: string;
  actualCompletionDate?: string;
  estimatedDurationDays: number;
  progressPercentage: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'OVERDUE';
  estimatedCost: number;
  actualCost: number;
  weight: number;
  overrideReason?: string;
  prerequisiteTaskIds?: number[];
  prerequisiteTaskCodes?: string[];
  isCriticalPath?: boolean;
  slackDays?: number;
}

export interface Milestone {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  targetDate: string;
  actualDate?: string;
  status: string;
  progressPercentage: number;
}

export interface Worker {
  id: number;
  workerCode: string;
  name: string;
  role: string;
  projectId?: number;
  zoneId?: number;
  zoneName?: string;
  shift: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  skillCategory?: string;
  certificationStatus?: string;
  safetyTrainingStatus?: string;
  safetyTrainingCompleted?: boolean;
  availability?: 'AVAILABLE' | 'ASSIGNED' | 'UNAVAILABLE' | boolean;
  available?: boolean;
}

export interface Equipment {
  id: number;
  equipmentCode?: string;
  code?: string;
  name: string;
  category: string;
  projectId?: number;
  currentZone?: string;
  zoneId?: number;
  zoneName?: string;
  operationalStatus?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'UNAVAILABLE';
  status?: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'UNAVAILABLE';
  utilizationPercentage: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  ownershipStatus?: string;
  ownershipType?: string;
  operatingCostPerDay?: number;
  hourlyOperatingCost?: number;
  assignedOperator?: string;
  maintenanceOverdue?: boolean;
}

export interface Material {
  id: number;
  projectId?: number;
  materialCode?: string;
  code?: string;
  name: string;
  category: string;
  unit: string;
  availableQuantity: number;
  reservedQuantity: number;
  freeQuantity?: number;
  reorderThreshold: number;
  unitPrice: number;
  stockValuation?: number;
  supplierName?: string;
  supplier?: string;
  storageZoneId?: number;
  storageZoneName?: string;
  storageZone?: string;
  isLowStock?: boolean;
  lastUpdated?: string;
}

export interface InventoryTransaction {
  id: number;
  materialId: number;
  materialName?: string;
  transactionType: 'RECEIVED' | 'CONSUMED' | 'RESERVED' | 'RELEASED';
  quantity: number;
  unit?: string;
  unitPrice?: number;
  referenceDocument?: string;
  referenceTaskId?: number;
  referenceTaskCode?: string;
  notes?: string;
  performedBy?: string;
  createdBy?: string;
  createdAt?: string;
  timestamp?: string;
}

export interface Risk {
  id: number;
  projectId: number;
  zoneId?: number;
  zoneName?: string;
  category: 'SCHEDULE' | 'RESOURCE' | 'SAFETY';
  title: string;
  description: string;
  riskScore?: number;
  score?: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  contributingFactors?: string;
  dynamicExplanation?: string;
  recommendedAction?: string;
  status?: string;
  assignedTo?: string;
  detectedAt?: string;
  resolvedAt?: string;
}

export interface RiskRecalculateResponse {
  projectId: number;
  overallScore: number;
  scheduleScore?: number;
  resourceScore?: number;
  safetyScore?: number;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary?: string;
  activeRisks?: Risk[];
  riskBreakdown?: Risk[];
  calculatedAt?: string;
}

export interface RiskAssessmentHistory {
  id: number;
  projectId: number;
  overallScore: number;
  scheduleScore: number;
  resourceScore: number;
  safetyScore: number;
  severity: string;
  summary: string;
  assessedAt: string;
}

export interface SafetyIncident {
  id: number;
  incidentCode: string;
  projectId: number;
  zoneId?: number;
  zoneName?: string;
  title: string;
  description: string;
  category?: string;
  severity: 'LOW' | 'MEDIUM' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED';
  reportedBy?: string;
  assignedTo?: string;
  incidentDate?: string;
  targetResolutionDate?: string;
  correctiveActions?: string;
  resolutionNotes?: string;
  resolvedDate?: string;
  resolvedAt?: string;
  createdAt?: string;
}

export interface BudgetEntry {
  id: number;
  projectId: number;
  category: string;
  plannedAmount: number;
  committedAmount: number;
  actualExpenditure: number;
  variance: number;
  periodMonth?: string;
  fiscalYear?: number;
  notes?: string;
}

export interface BudgetSummary {
  projectId: number;
  totalApprovedBudget?: number;
  totalBudget?: number;
  plannedBudget?: number;
  committedBudget?: number;
  committedCost?: number;
  actualExpenditure: number;
  remainingBudget?: number;
  budgetVariance?: number;
  varianceAmount?: number;
  utilizationPercentage: number;
  projectedCostAtCompletion?: number;
  estimatedCostAtCompletion?: number;
  costByCategory?: {
    category: string;
    allocated: number;
    actual: number;
    variance: number;
  }[];
  monthlyBurnRate?: {
    month: string;
    planned: number;
    actual: number;
  }[];
  categoryEntries?: BudgetEntry[];
}

export interface SimulationResult {
  scenarioName: string;
  baselineCompletionDate: string;
  simulatedCompletionDate?: string;
  projectedCompletionDate?: string;
  scheduleVarianceDays?: number;
  delayDays?: number;
  baselineCost: number;
  simulatedCost?: number;
  projectedCost?: number;
  costVariance?: number;
  costDelta?: number;
  baselineRiskScore: number;
  simulatedRiskScore: number;
  projectedRiskScore?: number;
  riskScoreDelta?: number;
  criticalPathTaskCodes?: string[];
  affectedTasks?: {
    taskId: number;
    taskCode: string;
    name: string;
    originalDurationDays: number;
    simulatedDurationDays: number;
    durationDeltaDays: number;
    isCriticalPath?: boolean;
  }[];
  criticalPath?: any[];
  taskComparisons?: any[];
  keyInsights?: string[];
  mitigationRecommendations?: string[];
  isApplied?: boolean;
}

export interface Notification {
  id: number;
  userId?: number;
  projectId?: number;
  title: string;
  message: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'INFO' | 'WARNING';
  category: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  entityType?: string;
  entityId?: number;
  timestamp?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: number;
  projectId?: number;
  actor: string;
  action?: string;
  actionType?: string;
  entityType: string;
  entityId?: number;
  details?: string;
  changeSummary?: string;
  ipAddress?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface DashboardSummary {
  projectId: number;
  projectName: string;
  projectCode: string;
  overallCompletionPercentage: number;
  plannedProgressPercentage: number;
  activeTasksCount: number;
  overdueTasksCount: number;
  activeWorkersCount: number;
  equipmentUtilizationPercentage: number;
  lowStockMaterialsCount: number;
  budgetSpent: number;
  totalBudget: number;
  openSafetyIncidentsCount: number;
  currentRiskScore: number;
  riskSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  progressTimeline: {
    date: string;
    plannedProgress: number;
    actualProgress?: number;
  }[];
  taskStatusDistribution: Record<string, number>;
  budgetBreakdown: {
    category: string;
    planned: number;
    actual: number;
  }[];
  riskSeverityDistribution: Record<string, number>;
  materialStockBars: {
    materialName: string;
    available: number;
    threshold: number;
    unit: string;
    isLowStock?: boolean;
  }[];
  upcomingMilestones?: {
    id: number;
    name: string;
    targetDate: string;
    progressPercentage: number;
    status: string;
  }[];
  criticalAlerts?: {
    id: number;
    title: string;
    severity: string;
    message: string;
    timestamp: string;
  }[];
  recentActivity?: AuditLog[];
}
