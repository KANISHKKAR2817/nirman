import axios from 'axios';
import {
  AuthDto,
  DashboardSummary,
  Project,
  ConstructionZone,
  Task,
  Milestone,
  Worker,
  Equipment,
  Material,
  InventoryTransaction,
  Risk,
  RiskRecalculateResponse,
  RiskAssessmentHistory,
  SafetyIncident,
  BudgetSummary,
  SimulationResult,
  Notification,
  AuditLog,
} from '../types';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('nirman_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Service Functions
export const api = {
  // Auth
  login: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Dashboard
  getDashboard: async (projectId = 1): Promise<DashboardSummary> => {
    const res = await apiClient.get('/dashboard', { params: { projectId } });
    return res.data;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get('/projects');
    return res.data;
  },
  getProjectById: async (id: number): Promise<Project> => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },
  createProject: async (projectData: any): Promise<Project> => {
    const res = await apiClient.post('/projects', projectData);
    return res.data;
  },

  // Zones
  getZones: async (projectId = 1): Promise<ConstructionZone[]> => {
    const res = await apiClient.get('/zones', { params: { projectId } });
    return res.data;
  },

  // Tasks
  getTasks: async (params?: { projectId?: number; status?: string; zoneId?: number }): Promise<Task[]> => {
    const res = await apiClient.get('/tasks', { params: { projectId: 1, ...params } });
    return res.data;
  },
  getTaskById: async (id: number): Promise<Task> => {
    const res = await apiClient.get(`/tasks/${id}`);
    return res.data;
  },
  createTask: async (taskData: any, projectId = 1): Promise<Task> => {
    const res = await apiClient.post('/tasks', taskData, { params: { projectId } });
    return res.data;
  },
  updateTaskProgress: async (
    taskId: number,
    progressPercentage: number | { progressPercentage: number; status?: string; overrideReason?: string },
    status?: string,
    overrideReason?: string
  ): Promise<Task> => {
    const payload =
      typeof progressPercentage === 'object'
        ? progressPercentage
        : { progressPercentage, status, overrideReason };
    const res = await apiClient.patch(`/tasks/${taskId}/progress`, payload);
    return res.data;
  },

  // Milestones
  getMilestones: async (projectId = 1): Promise<Milestone[]> => {
    const res = await apiClient.get('/milestones', { params: { projectId } });
    return res.data;
  },

  // Workers
  getWorkers: async (params?: number | { projectId?: number; availability?: string; zoneId?: number }): Promise<Worker[]> => {
    const queryParams = typeof params === 'number' ? { projectId: params } : { projectId: 1, ...params };
    const res = await apiClient.get('/workers', { params: queryParams });
    return res.data;
  },
  createWorker: async (workerData: any, projectId = 1): Promise<Worker> => {
    const res = await apiClient.post('/workers', workerData, { params: { projectId } });
    return res.data;
  },
  updateWorker: async (workerId: number, data: any): Promise<Worker> => {
    const res = await apiClient.patch(`/workers/${workerId}`, data);
    return res.data;
  },
  registerWorker: async (workerData: any, projectId = 1): Promise<Worker> => {
    const res = await apiClient.post('/workers', workerData, { params: { projectId } });
    return res.data;
  },
  assignWorker: async (payload: { workerId: number; taskId: number; roleInTask?: string }): Promise<Worker> => {
    const res = await apiClient.post('/workers/assign', payload);
    return res.data;
  },

  // Equipment
  getEquipment: async (params?: number | { projectId?: number; status?: string; zoneId?: number }): Promise<Equipment[]> => {
    const queryParams = typeof params === 'number' ? { projectId: params } : { projectId: 1, ...params };
    const res = await apiClient.get('/equipment', { params: queryParams });
    return res.data;
  },
  createEquipment: async (equipmentData: any, projectId = 1): Promise<Equipment> => {
    const res = await apiClient.post('/equipment', equipmentData, { params: { projectId } });
    return res.data;
  },
  updateEquipment: async (id: number, data: any): Promise<Equipment> => {
    const res = await apiClient.patch(`/equipment/${id}`, data);
    return res.data;
  },
  updateEquipmentStatus: async (id: number, status: string, zoneId?: number): Promise<Equipment> => {
    const res = await apiClient.patch(`/equipment/${id}/status`, null, { params: { status, zoneId } });
    return res.data;
  },

  // Materials & Inventory
  getMaterials: async (storageZoneId?: number): Promise<Material[]> => {
    const res = await apiClient.get('/materials', { params: { storageZoneId } });
    return res.data;
  },
  createMaterial: async (materialData: any): Promise<Material> => {
    const res = await apiClient.post('/materials', materialData);
    return res.data;
  },
  consumeMaterial: async (materialId: number, payload: { quantity: number; referenceTaskId?: number; notes?: string }): Promise<Material> => {
    const res = await apiClient.post(`/materials/${materialId}/consume`, payload);
    return res.data;
  },
  receiveMaterial: async (materialId: number, payload: { quantity: number; unitPrice?: number; notes?: string }): Promise<Material> => {
    const res = await apiClient.post(`/materials/${materialId}/receive`, payload);
    return res.data;
  },
  createInventoryTransaction: async (payload: any): Promise<InventoryTransaction> => {
    const res = await apiClient.post('/materials/transactions', payload);
    return res.data;
  },
  getInventoryTransactions: async (materialId?: number): Promise<InventoryTransaction[]> => {
    const res = await apiClient.get('/materials/transactions', { params: { materialId } });
    return res.data;
  },

  // Risks
  getRisks: async (projectId = 1): Promise<Risk[]> => {
    const res = await apiClient.get('/risks', { params: { projectId } });
    return res.data;
  },
  recalculateRisk: async (projectId = 1): Promise<RiskRecalculateResponse> => {
    const res = await apiClient.post('/risks/recalculate', null, { params: { projectId } });
    return res.data;
  },
  getRiskHistory: async (projectId = 1): Promise<RiskAssessmentHistory[]> => {
    const res = await apiClient.get('/risks/history', { params: { projectId } });
    return res.data;
  },

  // Safety Incidents
  getIncidents: async (params?: number | { projectId?: number; status?: string }): Promise<SafetyIncident[]> => {
    const queryParams = typeof params === 'number' ? { projectId: params } : { projectId: 1, ...params };
    const res = await apiClient.get('/incidents', { params: queryParams });
    return res.data;
  },
  createIncident: async (incidentData: any, projectId = 1): Promise<SafetyIncident> => {
    const res = await apiClient.post('/incidents', incidentData, { params: { projectId } });
    return res.data;
  },
  resolveIncident: async (incidentId: number, notes: string): Promise<SafetyIncident> => {
    const res = await apiClient.patch(`/incidents/${incidentId}/status`, null, {
      params: { status: 'RESOLVED', correctiveActions: notes },
    });
    return res.data;
  },
  updateIncidentStatus: async (id: number, status: string, correctiveActions?: string): Promise<SafetyIncident> => {
    const res = await apiClient.patch(`/incidents/${id}/status`, null, { params: { status, correctiveActions } });
    return res.data;
  },

  // Budget
  getBudgetSummary: async (projectId = 1): Promise<BudgetSummary> => {
    const res = await apiClient.get('/budget', { params: { projectId } });
    return res.data;
  },

  // What-If Simulations
  runSimulation: async (payload: { projectId: number; scenarioName?: string; scenarioDescription?: string; taskDurationChanges?: any[]; changes?: any[] }): Promise<SimulationResult> => {
    const res = await apiClient.post('/simulations/run', payload);
    return res.data;
  },
  applySimulationScenario: async (scenarioId = 1): Promise<void> => {
    await apiClient.post(`/simulations/${scenarioId}/apply`);
  },
  saveSimulation: async (payload: { projectId: number; scenarioName?: string; scenarioDescription?: string; changes: any[] }) => {
    const res = await apiClient.post('/simulations/save', payload);
    return res.data;
  },
  applySimulation: async (scenarioId: number) => {
    const res = await apiClient.post(`/simulations/${scenarioId}/apply`);
    return res.data;
  },
  getScenarios: async (projectId = 1) => {
    const res = await apiClient.get('/simulations', { params: { projectId } });
    return res.data;
  },

  // Reports
  getCsvExportUrl: (projectId = 1, type = 'SUMMARY') => {
    return `${API_BASE_URL}/reports/export?projectId=${projectId}&type=${type}`;
  },

  // Notifications
  getNotifications: async (projectId = 1): Promise<Notification[]> => {
    const res = await apiClient.get('/notifications', { params: { projectId } });
    return res.data;
  },
  getUnreadNotificationsCount: async (projectId = 1): Promise<number> => {
    const res = await apiClient.get('/notifications/unread-count', { params: { projectId } });
    return res.data.unreadCount;
  },
  markNotificationAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },
  markAllNotificationsAsRead: async (projectId = 1): Promise<void> => {
    await apiClient.post('/notifications/mark-all-read', null, { params: { projectId } });
  },

  // Audit Logs
  getAuditLogs: async (projectId = 1): Promise<AuditLog[]> => {
    const res = await apiClient.get('/audit-logs', { params: { projectId } });
    return res.data;
  },
};
