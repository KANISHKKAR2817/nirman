import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Equipment } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gauge,
  Box,
  IndianRupee,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EquipmentPage: React.FC = () => {
  const { currentProject, triggerRefresh } = useProject();
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newEquipment, setNewEquipment] = useState({
    code: '',
    name: '',
    category: 'HEAVY_CRANE',
    currentZone: 'Site Central Core',
    status: 'AVAILABLE' as const,
    utilizationPercentage: 65,
    lastMaintenanceDate: '2026-09-15',
    nextMaintenanceDate: '2026-11-15',
    ownershipType: 'OWNED',
    hourlyOperatingCost: 3500,
    assignedOperator: 'Suresh Murthy',
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.getEquipment(currentProject?.id || 1);
        if (res) setEquipmentList(res);
      } catch (err) {
        console.warn('Fallback loading equipment:', err);
      }
    };
    fetchEquipment();
  }, [currentProject?.id]);

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createEquipment({
        ...newEquipment,
        projectId: currentProject?.id || 1,
      });
      setEquipmentList((prev) => [...prev, created]);
      setIsAddModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
      const fallback: Equipment = {
        id: Date.now(),
        ...newEquipment,
        projectId: currentProject?.id || 1,
      };
      setEquipmentList((prev) => [...prev, fallback]);
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateStatus = async (
    eq: Equipment,
    newStatus: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'UNAVAILABLE'
  ) => {
    try {
      await api.updateEquipment(eq.id, { status: newStatus });
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === eq.id ? { ...e, status: newStatus } : e))
      );
      triggerRefresh();
    } catch (err) {
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === eq.id ? { ...e, status: newStatus } : e))
      );
    }
  };

  const filtered = equipmentList.filter((e) => {
    const codeText = e.code || e.equipmentCode || '';
    const statusText = e.status || e.operationalStatus || 'AVAILABLE';
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      codeText.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || statusText === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-500" />
            Heavy Machinery & Equipment Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tower cranes, hydraulic excavators, batching pumps, utilization analytics, and preventive maintenance.
          </p>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Plant Asset
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search equipment by code, model name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="select-field sm:w-48"
        >
          <option value="ALL">All Operational Statuses</option>
          <option value="AVAILABLE">Available / Ready</option>
          <option value="IN_USE">In Use / Operating</option>
          <option value="MAINTENANCE">Under Maintenance</option>
          <option value="UNAVAILABLE">Unavailable / Breakdown</option>
        </select>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((eq) => {
          const eqStatus = eq.status || eq.operationalStatus || 'AVAILABLE';
          const isUnderMaintenance = eqStatus === 'MAINTENANCE';
          return (
            <div
              key={eq.id}
              className={`panel-card p-5 relative flex flex-col justify-between transition-all ${
                isUnderMaintenance ? 'border-amber-700/60' : 'hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {eq.code || eq.equipmentCode}
                  </span>
                  <Badge
                    variant={
                      eqStatus === 'IN_USE'
                        ? 'info'
                        : eqStatus === 'AVAILABLE'
                        ? 'success'
                        : eqStatus === 'MAINTENANCE'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  >
                    {eqStatus.replace('_', ' ')}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-white mt-3 line-clamp-1">{eq.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                  <span>{eq.category.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{eq.currentZone || 'Site Ground'}</span>
                </div>

                {/* Utilization Gauge */}
                <div className="mt-4 space-y-1.5 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-blue-400" /> Operating Utilization
                    </span>
                    <span className="font-mono text-emerald-400">{eq.utilizationPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        eq.utilizationPercentage > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${eq.utilizationPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Maintenance & Telemetry Details */}
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Operator:</span>
                    <span className="font-medium text-white">{eq.assignedOperator || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hourly Operating Cost:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ₹{eq.hourlyOperatingCost}/hr
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Service Inspection:</span>
                    <span className="font-mono text-slate-300">{eq.nextMaintenanceDate}</span>
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateStatus(eq, 'IN_USE')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-300 text-[10px] font-bold border border-slate-700"
                  >
                    In Use
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(eq, 'AVAILABLE')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold border border-slate-700"
                  >
                    Free
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(eq, 'MAINTENANCE')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold border border-slate-700"
                  >
                    Service
                  </button>
                </div>
                <Link
                  to="/digital-twin"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Box className="w-3.5 h-3.5" /> 3D Pin
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Equipment */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Heavy Construction Machinery"
        maxWidth="md"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Equipment Asset Tag *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. EQP-CR-02"
                value={newEquipment.code}
                onChange={(e) => setNewEquipment({ ...newEquipment, code: e.target.value })}
                className="input-field uppercase font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Equipment / Model Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Putzmeister Boom Pump 36Z"
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Machinery Category
              </label>
              <select
                value={newEquipment.category}
                onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                className="select-field"
              >
                <option value="HEAVY_CRANE">Tower Crane / Mobile Crane</option>
                <option value="EARTHMOVING">Excavator / Backhoe</option>
                <option value="CONCRETE_PUMP">Concrete Boom Pump / Mixer</option>
                <option value="POWER_GENERATION">Diesel Genset</option>
                <option value="HOIST">Material Passenger Hoist</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Initial Zone / Bay
              </label>
              <input
                type="text"
                value={newEquipment.currentZone}
                onChange={(e) => setNewEquipment({ ...newEquipment, currentZone: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Certified Operator
              </label>
              <input
                type="text"
                value={newEquipment.assignedOperator}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, assignedOperator: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Hourly Operating Cost (₹)
              </label>
              <input
                type="number"
                value={newEquipment.hourlyOperatingCost}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, hourlyOperatingCost: Number(e.target.value) })
                }
                className="input-field"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Enroll Equipment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
