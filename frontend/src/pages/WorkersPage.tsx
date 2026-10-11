import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Worker, ConstructionZone } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Clock,
  HardHat,
  Phone,
  Layers,
} from 'lucide-react';

export const WorkersPage: React.FC = () => {
  const { currentProject, triggerRefresh } = useProject();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [zones, setZones] = useState<ConstructionZone[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [newWorker, setNewWorker] = useState({
    workerCode: '',
    name: '',
    role: 'Steel Fixer',
    skillCategory: 'SKILLED',
    shift: 'MORNING',
    zoneId: 1,
    phone: '+91 98765 43210',
    emergencyContact: '+91 98111 22334',
    certificationStatus: 'VALID',
    safetyTrainingCompleted: true,
    available: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wList, zList] = await Promise.all([
          api.getWorkers(currentProject?.id || 1),
          api.getZones(currentProject?.id || 1),
        ]);
        if (wList) setWorkers(wList);
        if (zList) setZones(zList);
      } catch (err) {
        console.warn('Fallback loading workers:', err);
      }
    };
    fetchData();
  }, [currentProject?.id]);

  const handleRegisterWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createWorker({
        ...newWorker,
        projectId: currentProject?.id || 1,
      });
      setWorkers((prev) => [...prev, created]);
      setIsRegisterModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      const fallback: Worker = {
        id: Date.now(),
        ...newWorker,
        projectId: currentProject?.id || 1,
      };
      setWorkers((prev) => [...prev, fallback]);
      setIsRegisterModalOpen(false);
    }
  };

  const toggleAvailability = async (worker: Worker) => {
    const updatedStatus = !worker.available;
    try {
      await api.updateWorker(worker.id, { available: updatedStatus });
      setWorkers((prev) =>
        prev.map((w) => (w.id === worker.id ? { ...w, available: updatedStatus } : w))
      );
      triggerRefresh();
    } catch (err) {
      setWorkers((prev) =>
        prev.map((w) => (w.id === worker.id ? { ...w, available: updatedStatus } : w))
      );
    }
  };

  const filtered = workers.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.workerCode.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || w.role === roleFilter;
    const matchesAvail =
      availabilityFilter === 'ALL' ||
      (availabilityFilter === 'AVAILABLE' ? w.available : !w.available);
    return matchesSearch && matchesRole && matchesAvail;
  });

  const activeCount = workers.filter((w) => w.available).length;
  const certifiedCount = workers.filter((w) => w.certificationStatus === 'VALID').length;
  const trainedSafetyCount = workers.filter((w) => w.safetyTrainingCompleted).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-500" />
            Workforce & Safety Certification Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Site labor deployment, trade certifications, OSHA/BIM safety compliance, and shift tracking.
          </p>
        </div>

        <button onClick={() => setIsRegisterModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Register Site Worker
        </button>
      </div>

      {/* Workforce Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Crew Roster</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{workers.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Across 4 trade crafts</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">On-Duty / Available</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{workers.length - activeCount} off-shift / leave</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Safety Induction Passed</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">{trainedSafetyCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{Math.round((trainedSafetyCount / (workers.length || 1)) * 100)}% site compliance</div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Valid Certifications</div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">{certifiedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Verified credentials</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by worker name, ID code, or craft role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="select-field sm:w-44"
        >
          <option value="ALL">All Trade Roles</option>
          <option value="Steel Fixer">Steel Fixer</option>
          <option value="Mason">Mason</option>
          <option value="Carpenter">Carpenter / Formwork</option>
          <option value="Electrician">Electrician / MEP</option>
          <option value="Crane Operator">Crane Operator</option>
          <option value="Welder">Structural Welder</option>
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="select-field sm:w-44"
        >
          <option value="ALL">All Availability</option>
          <option value="AVAILABLE">On Duty (Available)</option>
          <option value="UNAVAILABLE">Unavailable / Leave</option>
        </select>
      </div>

      {/* Workers Roster Table */}
      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Worker Code & Name</th>
                <th className="p-3.5">Trade Craft</th>
                <th className="p-3.5">Deployment Zone</th>
                <th className="p-3.5">Shift</th>
                <th className="p-3.5">Skill Level</th>
                <th className="p-3.5">Safety Compliance</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold font-mono text-[11px]">
                        {w.workerCode.slice(-2)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{w.name}</div>
                        <div className="font-mono text-[10px] text-slate-400">{w.workerCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <HardHat className="w-3.5 h-3.5 text-amber-400" />
                      <span>{w.role}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    <span className="font-mono">{w.zoneName || `Floor Level ${w.zoneId}`}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {w.shift}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge variant={w.skillCategory === 'MASTER' ? 'purple' : 'info'}>
                      {w.skillCategory}
                    </Badge>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-1.5">
                      {w.safetyTrainingCompleted ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> Trained
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Badge variant={w.available ? 'success' : 'neutral'}>
                      {w.available ? 'ON DUTY' : 'OFF DUTY'}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => toggleAvailability(w)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      {w.available ? 'Set Leave' : 'Set Active'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Worker */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Enroll Construction Site Worker"
        maxWidth="md"
      >
        <form onSubmit={handleRegisterWorker} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Worker Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. WRK-45"
                value={newWorker.workerCode}
                onChange={(e) => setNewWorker({ ...newWorker, workerCode: e.target.value })}
                className="input-field uppercase font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Full Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Devendra Kumar"
                value={newWorker.name}
                onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Trade Role *
              </label>
              <select
                value={newWorker.role}
                onChange={(e) => setNewWorker({ ...newWorker, role: e.target.value })}
                className="select-field"
              >
                <option value="Steel Fixer">Steel Fixer</option>
                <option value="Mason">Mason</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Electrician">Electrician</option>
                <option value="Crane Operator">Crane Operator</option>
                <option value="Welder">Welder</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Skill Classification
              </label>
              <select
                value={newWorker.skillCategory}
                onChange={(e) => setNewWorker({ ...newWorker, skillCategory: e.target.value })}
                className="select-field"
              >
                <option value="SEMI_SKILLED">Semi-Skilled</option>
                <option value="SKILLED">Skilled</option>
                <option value="MASTER">Master Craftsman</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Assigned Zone
              </label>
              <select
                value={newWorker.zoneId}
                onChange={(e) => setNewWorker({ ...newWorker, zoneId: Number(e.target.value) })}
                className="select-field"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    Floor {z.floorLevel}: {z.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Work Shift
              </label>
              <select
                value={newWorker.shift}
                onChange={(e) => setNewWorker({ ...newWorker, shift: e.target.value })}
                className="select-field"
              >
                <option value="MORNING">Morning (07:00 - 15:30)</option>
                <option value="EVENING">Evening (15:30 - 00:00)</option>
                <option value="NIGHT">Night Concrete Pour</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="safetyTrained"
              checked={newWorker.safetyTrainingCompleted}
              onChange={(e) =>
                setNewWorker({ ...newWorker, safetyTrainingCompleted: e.target.checked })
              }
              className="accent-emerald-500 rounded"
            />
            <label htmlFor="safetyTrained" className="text-xs text-slate-200">
              Completed mandatory NIRMAN Site Safety Induction & PPE Briefing
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Register Worker
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
