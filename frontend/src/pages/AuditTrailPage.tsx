import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { AuditLog } from '../types';
import { Badge } from '../components/common/Badge';
import {
  History,
  Search,
  User,
  Clock,
  Filter,
  ShieldCheck,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    action: 'TASK_PROGRESS_UPDATED',
    entityType: 'TASK',
    entityId: 6,
    actor: 'Aakash Patel (Site Engineer)',
    timestamp: '2026-10-12 02:45:10',
    details: 'Progress updated from 55% to 65% for TSK-06: L7 Structural Rebar Fixing.',
    ipAddress: '192.168.1.42',
  },
  {
    id: 2,
    action: 'INVENTORY_CONSUMED',
    entityType: 'MATERIAL',
    entityId: 2,
    actor: 'Storekeeper Ramesh',
    timestamp: '2026-10-12 01:20:00',
    details: 'Deducted 80 Bags of OPC 53 Cement for Level 7 column batching.',
    ipAddress: '192.168.1.18',
  },
  {
    id: 3,
    action: 'RISK_ASSESSMENT_EXECUTED',
    entityType: 'RISK_ENGINE',
    entityId: 1,
    actor: 'System Risk Engine (Deterministic)',
    timestamp: '2026-10-11 23:15:22',
    details: 'Recalculated project risk composite score: 68.4 (HIGH SEVERITY).',
    ipAddress: '127.0.0.1',
  },
  {
    id: 4,
    action: 'HAZARD_REPORTED',
    entityType: 'SAFETY_INCIDENT',
    entityId: 3,
    actor: 'Harpreet Singh (Safety Officer)',
    timestamp: '2026-10-11 19:30:45',
    details: 'Reported INC-03: Missing safety toe-boards at Level 6 perimeter scaffold.',
    ipAddress: '192.168.1.55',
  },
  {
    id: 5,
    action: 'EQUIPMENT_STATUS_CHANGED',
    entityType: 'EQUIPMENT',
    entityId: 1,
    actor: 'Suresh Murthy (Crane Operator)',
    timestamp: '2026-10-11 16:10:00',
    details: 'Liebherr TC-01 status transitioned from MAINTENANCE to IN_USE.',
    ipAddress: '192.168.1.30',
  },
  {
    id: 6,
    action: 'DEPENDENCY_OVERRIDE_RECORDED',
    entityType: 'TASK',
    entityId: 4,
    actor: 'Rajesh Sharma (Project Manager)',
    timestamp: '2026-10-11 14:00:12',
    details: 'Authorized fast-track dependency override on TSK-04 with structural consultant signoff.',
    ipAddress: '192.168.1.10',
  },
];

export const AuditTrailPage: React.FC = () => {
  const { currentProject } = useProject();
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAuditLogs(currentProject?.id || 1);
        if (res && res.length > 0) setLogs(res);
      } catch (err) {
        console.warn('Fallback loading audit logs:', err);
      }
    };
    fetchLogs();
  }, [currentProject?.id]);

  const filtered = logs.filter((l) => {
    const detailsText = l.details || l.changeSummary || '';
    const actionText = l.action || l.actionType || '';
    const matchesSearch =
      detailsText.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      actionText.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || actionText === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-500" />
            Immutable Construction Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident record of all work package updates, stock deductions, dependency overrides, and risk recalculations.
          </p>
        </div>

        <Badge variant="success" size="md">
          <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Ledger
        </Badge>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search audit trail by actor, operation, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="select-field sm:w-56"
        >
          <option value="ALL">All Event Types</option>
          <option value="TASK_PROGRESS_UPDATED">Task Progress Changes</option>
          <option value="INVENTORY_CONSUMED">Stock Consumption</option>
          <option value="HAZARD_REPORTED">Safety Hazard Logs</option>
          <option value="RISK_ASSESSMENT_EXECUTED">Risk Engine Executions</option>
          <option value="DEPENDENCY_OVERRIDE_RECORDED">Dependency Overrides</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="panel-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Operational Actor</th>
                <th className="p-3.5">Audit Detail Description</th>
                <th className="p-3.5 text-right">Host / IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5">
                    <span className="font-mono font-bold text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {log.entityType} #{log.entityId}
                  </td>
                  <td className="p-3.5 text-slate-200 font-medium">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.actor}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-300 max-w-md">
                    {log.details}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-500 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
