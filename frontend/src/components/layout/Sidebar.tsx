import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  FolderGit2,
  CheckSquare,
  Users,
  Truck,
  Package,
  ShieldAlert,
  GitBranch,
  IndianRupee,
  FileSpreadsheet,
  Bell,
  History,
  Presentation,
  ChevronLeft,
  ChevronRight,
  HardHat
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle, unreadCount = 4 }) => {
  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, badge: null },
    { to: '/digital-twin', label: '3D Digital Twin', icon: Box, highlight: true },
    { to: '/projects', label: 'Projects', icon: FolderGit2, badge: null },
    { to: '/tasks', label: 'Progress & Tasks', icon: CheckSquare, badge: '1 Overdue' },
    { to: '/workers', label: 'Workers', icon: Users, badge: null },
    { to: '/equipment', label: 'Equipment', icon: Truck, badge: null },
    { to: '/materials', label: 'Materials & Stock', icon: Package, badge: 'Low Stock' },
    { to: '/risk-safety', label: 'Risk & Safety', icon: ShieldAlert, badge: 'High Risk', isAlert: true },
    { to: '/simulator', label: 'Schedule Simulator', icon: GitBranch, highlight: true },
    { to: '/budget', label: 'Budget & Costs', icon: IndianRupee, badge: null },
    { to: '/reports', label: 'Reports & Exports', icon: FileSpreadsheet, badge: null },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null },
    { to: '/audit-trail', label: 'Audit Trail', icon: History, badge: null },
    { to: '/presentation', label: 'Judges Walkthrough', icon: Presentation, special: true },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header / Tagline */}
      {!collapsed && (
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-construction-400">
            <HardHat className="w-4 h-4 text-construction-400 flex-shrink-0" />
            <span className="uppercase tracking-widest text-[11px] font-mono">BIM Digital Twin</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
            NIRMAN Smart Tower SRT-01
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-construction-600/20 text-construction-300 font-semibold border border-construction-500/30 shadow-sm'
                    : item.special
                    ? 'text-emerald-300 hover:bg-emerald-950/30 border border-emerald-700/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  item.special
                    ? 'text-emerald-400'
                    : item.highlight
                    ? 'text-construction-400'
                    : item.isAlert
                    ? 'text-amber-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}

              {!collapsed && item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.isAlert
                      ? 'bg-red-950/80 text-red-400 border border-red-800/50'
                      : item.badge === 'Low Stock'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed hover */}
              {collapsed && (
                <div className="absolute left-full ml-2 hidden group-hover:block px-2.5 py-1 bg-slate-950 text-white text-[11px] font-semibold rounded border border-slate-700 whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between">
        {!collapsed && (
          <div className="text-[11px] text-slate-500 font-mono">
            v1.0.0 • Hackathon Edition
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors mx-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
