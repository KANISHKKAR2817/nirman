import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Task, ConstructionZone } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  AlertTriangle,
  GitCommit,
  CheckCircle2,
  Sliders,
  Layers,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { currentProject, triggerRefresh } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [zones, setZones] = useState<ConstructionZone[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'GANTT' | 'KANBAN'>('LIST');

  // Modal State for Task Update / Create
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  const [newTask, setNewTask] = useState({
    taskCode: '',
    name: '',
    description: '',
    zoneId: 1,
    assignedTeam: 'Civil Concrete Crew A',
    startDate: '2026-10-15',
    dueDate: '2026-10-25',
    estimatedDurationDays: 10,
    progressPercentage: 0,
    priority: 'HIGH' as const,
    estimatedCost: 1200000,
    weight: 1.0,
  });

  useEffect(() => {
    const fetchTasksAndZones = async () => {
      try {
        const [taskData, zoneData] = await Promise.all([
          api.getTasks({ projectId: currentProject?.id || 1 }),
          api.getZones(currentProject?.id || 1),
        ]);
        if (taskData) setTasks(taskData);
        if (zoneData) setZones(zoneData);
      } catch (err) {
        console.warn('Fallback loading tasks:', err);
      }
    };
    fetchTasksAndZones();
  }, [currentProject?.id]);

  const handleUpdateProgress = async (task: Task, newProgress: number) => {
    // If attempting to mark 100% when prerequisites are incomplete
    if (newProgress === 100 && task.prerequisiteTaskIds && task.prerequisiteTaskIds.length > 0) {
      const incompletePrereqs = tasks.filter(
        (t) => task.prerequisiteTaskIds?.includes(t.id) && t.progressPercentage < 100
      );
      if (incompletePrereqs.length > 0) {
        setEditingTask(task);
        setIsOverrideModalOpen(true);
        return;
      }
    }

    try {
      const updatedStatus =
        newProgress === 100 ? 'COMPLETED' : newProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      await api.updateTaskProgress(task.id, newProgress, updatedStatus);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, progressPercentage: newProgress, status: updatedStatus } : t
        )
      );
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update progress on backend:', err);
      // Optimistic update
      const updatedStatus =
        newProgress === 100 ? 'COMPLETED' : newProgress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, progressPercentage: newProgress, status: updatedStatus } : t
        )
      );
    }
  };

  const handleApplyOverrideCompletion = async () => {
    if (!editingTask || !overrideReason) return;
    try {
      await api.updateTaskProgress(editingTask.id, 100, 'COMPLETED', overrideReason);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, progressPercentage: 100, status: 'COMPLETED', overrideReason }
            : t
        )
      );
      setIsOverrideModalOpen(false);
      setOverrideReason('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
      setIsOverrideModalOpen(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createTask({
        ...newTask,
        projectId: currentProject?.id || 1,
        status: 'NOT_STARTED',
        actualCost: 0,
      });
      setTasks((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      const fallbackTask: Task = {
        id: Date.now(),
        ...newTask,
        projectId: currentProject?.id || 1,
        status: 'NOT_STARTED',
        actualCost: 0,
      };
      setTasks((prev) => [...prev, fallbackTask]);
      setIsCreateModalOpen(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.taskCode.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedTeam && t.assignedTeam.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesZone = zoneFilter === 'ALL' || String(t.zoneId) === zoneFilter;
    return matchesSearch && matchesStatus && matchesZone;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-500" />
            Construction Work Packages & CPM Progress
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Critical Path Method (CPM) dependency validation, progress tracking, and schedule governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                viewMode === 'LIST' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('GANTT')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                viewMode === 'GANTT' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gantt CPM
            </button>
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                viewMode === 'KANBAN' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
          </div>

          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Work Package
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by task code, activity name, or contractor crew..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field sm:w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="OVERDUE">Overdue</option>
          <option value="BLOCKED">Blocked</option>
          <option value="NOT_STARTED">Not Started</option>
        </select>
        <select
          value={zoneFilter}
          onChange={(e) => setZoneFilter(e.target.value)}
          className="select-field sm:w-48"
        >
          <option value="ALL">All Construction Zones</option>
          {zones.map((z) => (
            <option key={z.id} value={String(z.id)}>
              Lvl {z.floorLevel}: {z.name}
            </option>
          ))}
        </select>
      </div>

      {/* View Mode: LIST */}
      {viewMode === 'LIST' && (
        <div className="panel-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Code & Work Package</th>
                  <th className="p-3.5">Zone / Floor</th>
                  <th className="p-3.5">Assigned Crew</th>
                  <th className="p-3.5">Schedule Dates</th>
                  <th className="p-3.5">CPM Path</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 w-44">Progress (%)</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-emerald-400">{t.taskCode}</div>
                      <div className="font-semibold text-white mt-0.5">{t.name}</div>
                      {t.overrideReason && (
                        <div className="text-[10px] text-amber-400 mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Override: {t.overrideReason}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <span className="font-medium">{t.zoneName || `Zone ${t.zoneId}`}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <span>{t.assignedTeam || 'Structural Subcontractor'}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      <div>Start: {t.startDate}</div>
                      <div className={t.status === 'OVERDUE' ? 'text-red-400 font-bold' : ''}>
                        Due: {t.dueDate}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {t.isCriticalPath ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/80 animate-pulse">
                          CRITICAL PATH
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-[10px]">
                          Slack: {t.slackDays || 4}d
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          t.status === 'COMPLETED'
                            ? 'success'
                            : t.status === 'OVERDUE'
                            ? 'danger'
                            : t.status === 'BLOCKED'
                            ? 'danger'
                            : 'info'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={t.progressPercentage}
                          onChange={(e) => handleUpdateProgress(t, Number(e.target.value))}
                          className="w-24 accent-emerald-500 cursor-pointer"
                        />
                        <span className="font-mono font-bold text-white w-10 text-right">
                          {t.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleUpdateProgress(t, 100)}
                        disabled={t.progressPercentage === 100}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-slate-700 text-[11px] font-semibold transition-colors disabled:opacity-40"
                      >
                        Complete ✓
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode: GANTT Visualizer */}
      {viewMode === 'GANTT' && (
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">CPM Schedule Timeline (Gantt)</h3>
              <p className="text-[11px] text-slate-400">
                Visualizing sequence of tasks, dependencies, and critical path activities.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-3 h-3 rounded bg-red-600" /> Critical Path
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded bg-emerald-600" /> Completed
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-3 rounded bg-blue-600" /> Non-Critical
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredTasks.map((t) => {
              const widthPct = Math.min(100, Math.max(15, t.estimatedDurationDays * 6));
              const progressPct = t.progressPercentage;
              const barColor = t.isCriticalPath
                ? 'bg-red-600'
                : t.status === 'COMPLETED'
                ? 'bg-emerald-600'
                : 'bg-blue-600';

              return (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{t.taskCode}</span>
                      <span className="text-white font-medium">{t.name}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {t.startDate} → {t.dueDate} ({t.estimatedDurationDays}d)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-lg h-7 p-1 border border-slate-800 relative">
                    <div
                      className={`h-full rounded-md ${barColor} relative overflow-hidden transition-all duration-300 flex items-center px-2`}
                      style={{ width: `${widthPct}%` }}
                    >
                      {/* Completed fill stripes */}
                      <div
                        className="absolute inset-y-0 left-0 bg-white/20 transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                      <span className="relative z-10 text-[10px] font-bold text-white font-mono">
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Mode: KANBAN */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            return (
              <div key={colStatus} className="panel-card p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    {colStatus.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-emerald-400 text-[11px]">
                          {t.taskCode}
                        </span>
                        {t.isCriticalPath && (
                          <span className="text-[9px] font-bold bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-800">
                            CPM
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400">Due: {t.dueDate}</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${t.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Work Package */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Work Package"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Task Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. TSK-19"
                value={newTask.taskCode}
                onChange={(e) => setNewTask({ ...newTask, taskCode: e.target.value })}
                className="input-field uppercase font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Task Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 10th Floor Column Concreting"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Construction Zone / Floor *
            </label>
            <select
              value={newTask.zoneId}
              onChange={(e) => setNewTask({ ...newTask, zoneId: Number(e.target.value) })}
              className="select-field"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  Level {z.floorLevel}: {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Assigned Trade Crew
              </label>
              <input
                type="text"
                value={newTask.assignedTeam}
                onChange={(e) => setNewTask({ ...newTask, assignedTeam: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Estimated Cost (₹)
              </label>
              <input
                type="number"
                value={newTask.estimatedCost}
                onChange={(e) => setNewTask({ ...newTask, estimatedCost: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Planned Start Date
              </label>
              <input
                type="date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Planned Due Date
              </label>
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Schedule Work Package
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Dependency Override Confirmation */}
      <Modal
        isOpen={isOverrideModalOpen}
        onClose={() => setIsOverrideModalOpen(false)}
        title="⚠️ Dependency Constraint Violation Override"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              Unfinished Prerequisite Tasks Detected
            </div>
            <p className="text-[11px] text-red-300">
              Under engineering standards, task{' '}
              <strong>{editingTask?.taskCode}</strong> cannot be marked 100% complete while
              prerequisite tasks remain incomplete without an explicit management override.
            </p>
          </div>

          <div>
            <label className="font-semibold text-slate-200 block mb-1">
              Recorded Engineering Justification *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g., Authorized fast-track curing agent used and approved by structural consultant."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsOverrideModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyOverrideCompletion}
              disabled={!overrideReason.trim()}
              className="btn-outline-danger"
            >
              Confirm Authorized Override
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
