import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Notification } from '../types';
import { Badge } from '../components/common/Badge';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Schedule Bottleneck: 7th Floor Slab Rebar Overdue',
    message: 'Critical path task TSK-06 is 3.5 days behind schedule. Slab concreting cannot start.',
    severity: 'CRITICAL',
    category: 'SCHEDULE',
    isRead: false,
    entityType: 'TASK',
    entityId: 6,
    timestamp: '15 mins ago',
  },
  {
    id: 2,
    title: 'Low Stock Hazard: OPC 53 Grade Portland Cement',
    message: 'Available inventory is 320 Bags, falling below the mandatory 500-bag reorder threshold.',
    severity: 'HIGH',
    category: 'MATERIAL',
    isRead: false,
    entityType: 'MATERIAL',
    entityId: 2,
    timestamp: '45 mins ago',
  },
  {
    id: 3,
    title: 'Safety Hazard Logged: Scaffold Toe-Boards Missing',
    message: 'Level 6 exterior bracket scaffold flagged by Safety Officer. Remediation required.',
    severity: 'HIGH',
    category: 'SAFETY',
    isRead: false,
    entityType: 'INCIDENT',
    entityId: 3,
    timestamp: '2 hours ago',
  },
  {
    id: 4,
    title: 'Plant Machinery Check: Liebherr TC-01 Cleared',
    message: 'Monthly preventive hydraulic inspection completed with 0 structural faults found.',
    severity: 'LOW',
    category: 'EQUIPMENT',
    isRead: true,
    entityType: 'EQUIPMENT',
    entityId: 1,
    timestamp: '5 hours ago',
  },
  {
    id: 5,
    title: 'Milestone Approaching: 8th Floor Slab Pouring',
    message: 'Target pour date set for 18th Oct. Ensure batching plant logistics are pre-booked.',
    severity: 'MODERATE',
    category: 'MILESTONE',
    isRead: true,
    entityType: 'PROJECT',
    entityId: 1,
    timestamp: '1 day ago',
  },
];

export const NotificationsPage: React.FC = () => {
  const { currentProject, triggerRefresh } = useProject();
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.getNotifications(currentProject?.id || 1);
        if (res && res.length > 0) setNotifications(res);
      } catch (err) {
        console.warn('Fallback loading notifications:', err);
      }
    };
    fetchNotifs();
  }, [currentProject?.id]);

  const markAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      triggerRefresh();
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead(currentProject?.id || 1);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      triggerRefresh();
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const filtered = notifications.filter((n) => {
    return filterSeverity === 'ALL' || n.severity === filterSeverity;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-500" />
            Operational Event Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical path delays, material reorder triggers, and safety incident dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-secondary">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 text-xs">
        {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterSeverity === sev
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((notif) => (
          <div
            key={notif.id}
            className={`panel-card p-4 flex items-start justify-between gap-4 transition-all ${
              !notif.isRead
                ? 'border-l-4 border-l-emerald-500 bg-slate-900'
                : 'opacity-75 bg-slate-900/60'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2 rounded-lg border mt-0.5 ${
                  notif.severity === 'CRITICAL'
                    ? 'bg-red-950/80 border-red-800 text-red-400'
                    : notif.severity === 'HIGH'
                    ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                    : 'bg-blue-950/80 border-blue-800 text-blue-400'
                }`}
              >
                {notif.severity === 'CRITICAL' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                  <Badge
                    variant={
                      notif.severity === 'CRITICAL'
                        ? 'danger'
                        : notif.severity === 'HIGH'
                        ? 'warning'
                        : 'info'
                    }
                    size="sm"
                  >
                    {notif.category}
                  </Badge>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">{notif.message}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {notif.timestamp}
                  </span>
                  <span>•</span>
                  <span>Entity: {notif.entityType} #{notif.entityId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!notif.isRead && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  Mark Read
                </button>
              )}
              {notif.category === 'SCHEDULE' && (
                <Link to="/tasks" className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {notif.category === 'MATERIAL' && (
                <Link to="/materials" className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {notif.category === 'SAFETY' && (
                <Link to="/risk-safety" className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
