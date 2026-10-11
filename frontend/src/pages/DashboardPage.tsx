import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { DashboardSummary } from '../types';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Truck,
  Package,
  IndianRupee,
  ShieldAlert,
  Activity,
  ArrowRight,
  Box,
  GitBranch,
  RefreshCw,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

// Fallback initial data in case backend is starting
const INITIAL_DASHBOARD: DashboardSummary = {
  projectId: 1,
  projectName: 'NIRMAN Smart Residential Tower',
  projectCode: 'NIRMAN-SRT-01',
  overallCompletionPercentage: 48.5,
  plannedProgressPercentage: 58.0,
  activeTasksCount: 18,
  overdueTasksCount: 2,
  activeWorkersCount: 42,
  equipmentUtilizationPercentage: 76.4,
  lowStockMaterialsCount: 2,
  budgetSpent: 42500000,
  totalBudget: 85000000,
  openSafetyIncidentsCount: 3,
  currentRiskScore: 68.4,
  riskSeverity: 'HIGH',
  progressTimeline: [
    { date: 'Jan 26', plannedProgress: 5.0, actualProgress: 5.0 },
    { date: 'Feb 26', plannedProgress: 15.0, actualProgress: 16.5 },
    { date: 'Mar 26', plannedProgress: 28.0, actualProgress: 27.0 },
    { date: 'Apr 26', plannedProgress: 38.0, actualProgress: 37.5 },
    { date: 'May 26', plannedProgress: 45.0, actualProgress: 44.0 },
    { date: 'Jun 26', plannedProgress: 50.0, actualProgress: 48.5 },
    { date: 'Jul 26', plannedProgress: 58.0, actualProgress: 48.5 },
    { date: 'Aug 26 (P)', plannedProgress: 68.0 },
    { date: 'Sep 26 (P)', plannedProgress: 78.0 },
    { date: 'Oct 26 (P)', plannedProgress: 88.0 },
    { date: 'Dec 26 (P)', plannedProgress: 100.0 },
  ],
  taskStatusDistribution: {
    COMPLETED: 8,
    IN_PROGRESS: 6,
    BLOCKED: 2,
    OVERDUE: 2,
    NOT_STARTED: 4,
  },
  budgetBreakdown: [
    { category: 'Structural Concrete', planned: 25000000, actual: 23500000 },
    { category: 'Rebar & Steel', planned: 20000000, actual: 18900000 },
    { category: 'Heavy Machinery', planned: 15000000, actual: 14200000 },
    { category: 'MEP Services', planned: 12000000, actual: 6400000 },
    { category: 'Interior Finishes', planned: 13000000, actual: 2500000 },
  ],
  riskSeverityDistribution: {
    LOW: 4,
    MODERATE: 3,
    HIGH: 2,
    CRITICAL: 1,
  },
  materialStockBars: [
    { materialName: 'TMT Steel Rebar', available: 142, threshold: 50, unit: 'Tonnes' },
    { materialName: 'OPC Cement', available: 320, threshold: 500, unit: 'Bags' },
    { materialName: 'Ready-Mix Concrete', available: 45, threshold: 60, unit: 'm³' },
    { materialName: 'River Sand', available: 210, threshold: 100, unit: 'Tonnes' },
    { materialName: 'Coarse Aggregate', available: 380, threshold: 150, unit: 'Tonnes' },
  ],
  upcomingMilestones: [
    { id: 3, name: 'L8 Floor Slab Concrete Pouring', targetDate: '2026-10-18', progressPercentage: 65, status: 'IN_PROGRESS' },
    { id: 4, name: 'Elevator Shaft Concrete Curing', targetDate: '2026-10-25', progressPercentage: 40, status: 'IN_PROGRESS' },
    { id: 5, name: 'Structural Framing Signoff L1-L9', targetDate: '2026-11-10', progressPercentage: 0, status: 'PENDING' },
  ],
  criticalAlerts: [
    {
      id: 1,
      title: 'Schedule Slippage on 7th Floor Slab',
      severity: 'CRITICAL',
      message: 'Critical path task delayed by 3.5 days. Slab concreting cannot proceed until rebar tying completes.',
      timestamp: '25 mins ago',
    },
    {
      id: 2,
      title: 'Cement Stock Below Threshold',
      severity: 'HIGH',
      message: 'OPC 53 Grade Cement at 320 bags (minimum requirement 500 bags for batching).',
      timestamp: '1 hour ago',
    },
    {
      id: 3,
      title: 'Safety Hazard Reported: Zone East Scaffolding',
      severity: 'HIGH',
      message: 'Missing safety toe-boards at Level 6 exterior bracket scaffold.',
      timestamp: '3 hours ago',
    },
  ],
};

const TASK_STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#10b981',
  IN_PROGRESS: '#3b82f6',
  BLOCKED: '#ef4444',
  OVERDUE: '#f59e0b',
  NOT_STARTED: '#64748b',
};

export const DashboardPage: React.FC = () => {
  const { currentProject, refreshTrigger } = useProject();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary>(INITIAL_DASHBOARD);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.getDashboard(currentProject?.id || 1);
        if (isMounted && res) {
          setData(res);
        }
      } catch (err) {
        console.warn('Using baseline dashboard fallback while backend connects:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, [currentProject?.id, refreshTrigger]);

  const handleRecalculateRisk = async () => {
    try {
      setIsRecalculating(true);
      await api.recalculateRisk(currentProject?.id || 1);
      const updated = await api.getDashboard(currentProject?.id || 1);
      if (updated) setData(updated);
    } catch (err) {
      console.error('Failed to recalculate risk:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const taskPieData = Object.entries(data.taskStatusDistribution || {}).map(([key, value]) => ({
    name: key.replace('_', ' '),
    value,
    color: TASK_STATUS_COLORS[key] || '#94a3b8',
  }));

  const riskPieData = Object.entries(data.riskSeverityDistribution || {}).map(([key, value]) => {
    const colors: Record<string, string> = {
      LOW: '#10b981',
      MODERATE: '#eab308',
      HIGH: '#f97316',
      CRITICAL: '#ef4444',
    };
    return { name: key, value, color: colors[key] || '#64748b' };
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header with Project Health & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white">Project Command Center</h1>
            <Badge variant="purple" size="md">
              <span className="font-mono">{data.projectCode}</span>
            </Badge>
            <Badge
              variant={
                data.riskSeverity === 'CRITICAL'
                  ? 'danger'
                  : data.riskSeverity === 'HIGH'
                  ? 'warning'
                  : 'success'
              }
              size="md"
            >
              Risk Index: {data.currentRiskScore.toFixed(1)} ({data.riskSeverity})
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital twin metrics, critical path schedule variance, and explainable safety analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalculateRisk}
            disabled={isRecalculating}
            className="btn-secondary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-emerald-400' : ''}`} />
            {isRecalculating ? 'Evaluating Risks...' : 'Recalculate Risk'}
          </button>
          <Link to="/digital-twin" className="btn-primary">
            <Box className="w-3.5 h-3.5" />
            Launch 3D Twin
          </Link>
          <Link to="/simulator" className="btn-secondary">
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            Run Simulation
          </Link>
        </div>
      </div>

      {/* KPI Cards Row (10 Core Real-time Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Actual Progress"
          value={`${data.overallCompletionPercentage}%`}
          subtitle={`Target: ${data.plannedProgressPercentage}%`}
          icon={TrendingUp}
          change="-9.5% variance"
          isPositiveChange={false}
          linkTo="/tasks"
        />
        <KpiCard
          title="Active Tasks"
          value={data.activeTasksCount}
          subtitle={`${data.overdueTasksCount} overdue`}
          icon={Clock}
          alert={data.overdueTasksCount > 0}
          linkTo="/tasks"
        />
        <KpiCard
          title="Deployed Crew"
          value={data.activeWorkersCount}
          subtitle="4 active trade shifts"
          icon={Users}
          linkTo="/workers"
        />
        <KpiCard
          title="Fleet Utilization"
          value={`${data.equipmentUtilizationPercentage}%`}
          subtitle="8 units on site"
          icon={Truck}
          linkTo="/equipment"
        />
        <KpiCard
          title="Low Stock Items"
          value={data.lowStockMaterialsCount}
          subtitle="Cement & RMC alert"
          icon={Package}
          alert={data.lowStockMaterialsCount > 0}
          linkTo="/materials"
        />
        <KpiCard
          title="Budget Spent"
          value={`₹${(data.budgetSpent / 10000000).toFixed(2)} Cr`}
          subtitle={`Total: ₹${(data.totalBudget / 10000000).toFixed(1)} Cr`}
          icon={IndianRupee}
          linkTo="/budget"
        />
        <KpiCard
          title="Safety Hazards"
          value={data.openSafetyIncidentsCount}
          subtitle="1 critical hazard"
          icon={ShieldAlert}
          alert={data.openSafetyIncidentsCount > 0}
          linkTo="/risk-safety"
        />
        <KpiCard
          title="Risk Index"
          value={data.currentRiskScore.toFixed(1)}
          subtitle={data.riskSeverity}
          icon={AlertTriangle}
          alert={data.currentRiskScore > 50}
          linkTo="/risk-safety"
        />
        <KpiCard
          title="Schedule Health"
          value="SLIPPING"
          subtitle="3.5d Critical Path delay"
          icon={Activity}
          alert={true}
          linkTo="/simulator"
        />
        <KpiCard
          title="Digital Twin Sync"
          value="LIVE"
          subtitle="14 Floors mapped"
          icon={Box}
          linkTo="/digital-twin"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Progress S-Curve (Planned vs Actual) */}
        <div className="lg:col-span-2 panel-card">
          <div className="panel-header">
            <div>
              <h3 className="font-bold text-sm text-white">Project Progress S-Curve</h3>
              <p className="text-[11px] text-slate-400">Baseline Planned Progress vs Actual Site Work</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-0.5 bg-blue-500 rounded-full" /> Planned
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" /> Actual
              </span>
            </div>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.progressTimeline} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis unit="%" stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="plannedProgress" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Planned (%)" />
                <Line type="monotone" dataKey="actualProgress" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} name="Actual (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="panel-card flex flex-col justify-between">
          <div className="panel-header">
            <div>
              <h3 className="font-bold text-sm text-white">Task Status Breakdown</h3>
              <p className="text-[11px] text-slate-400">{data.activeTasksCount} active work packages</p>
            </div>
          </div>
          <div className="p-4 h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={3}>
                  {taskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 grid grid-cols-2 gap-2 text-xs">
            {taskPieData.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: t.color }} />
                <span className="text-[11px] capitalize">{t.name}:</span>
                <span className="font-bold font-mono text-[11px]">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Budget Allocation by Work Breakdown */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="font-bold text-sm text-white">Cost Breakdown (₹ Lakhs)</h3>
              <p className="text-[11px] text-slate-400">Planned Budget vs Actual Incurred</p>
            </div>
          </div>
          <div className="p-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(data.budgetBreakdown || []).map((b) => ({
                  category: b.category.split(' ')[0],
                  Planned: Math.round(b.planned / 100000),
                  Actual: Math.round(b.actual / 100000),
                }))}
                margin={{ top: 5, right: 10, bottom: 5, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="Planned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Material Stock Health Bars */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3 className="font-bold text-sm text-white">Critical Material Inventory</h3>
              <p className="text-[11px] text-slate-400">Current Stock vs Minimum Safety Reorder Buffer</p>
            </div>
            <Link to="/materials" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Stockyard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-3.5">
            {(data.materialStockBars || []).map((mat) => {
              const ratio = Math.min(100, Math.round((mat.available / (mat.threshold * 2)) * 100));
              const isLow = mat.available < mat.threshold;
              return (
                <div key={mat.materialName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{mat.materialName}</span>
                    <span className={`font-mono ${isLow ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                      {mat.available} / {mat.threshold} {mat.unit} {isLow && '⚠️'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isLow ? 'bg-red-500' : ratio < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Alerts & Upcoming Milestones */}
        <div className="panel-card flex flex-col justify-between">
          <div className="panel-header">
            <div>
              <h3 className="font-bold text-sm text-white">Upcoming Milestones & Hazards</h3>
              <p className="text-[11px] text-slate-400">Critical deliverables for this sprint</p>
            </div>
            <Badge variant="danger" size="sm">
              {data.criticalAlerts?.length || 0} Alerts
            </Badge>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-72">
            {data.criticalAlerts?.map((alert) => (
              <div
                key={alert.id}
                className="p-2.5 rounded-lg bg-red-950/20 border border-red-800/40 text-xs hover:border-red-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400">{alert.title}</span>
                  <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">{alert.message}</p>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Approaching Milestones
              </span>
              <div className="space-y-2">
                {data.upcomingMilestones?.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs bg-slate-950/40 p-2 rounded border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-200">{m.name}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">{m.progressPercentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
