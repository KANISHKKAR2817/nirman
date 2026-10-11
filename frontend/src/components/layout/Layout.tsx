import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useProject } from '../../context/ProjectContext';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const { isBackendConnected, triggerRefresh } = useProject();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        unreadNotificationsCount={3}
      />

      {/* Backend connection warning banner if server is off */}
      {!isBackendConnected && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 text-xs text-amber-200 flex items-center justify-between sticky top-16 z-30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Offline Prototype Mode:</strong> Backend at localhost:8080 is unreachable. Displaying cached simulation data.
            </span>
          </div>
          <button
            onClick={() => triggerRefresh()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-100 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Connection
          </button>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          unreadCount={3}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 p-4 md:p-6 overflow-y-auto ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Slideout Notification Drawer */}
      {showNotificationDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-wide">Live Event Notifications</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-950/80 text-red-400 border border-red-800/60">
                    3 Unread
                  </span>
                </div>
                <button
                  onClick={() => setShowNotificationDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/50 hover:border-red-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Critical Schedule Hazard</span>
                    <span className="text-[10px] text-slate-400">10m ago</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mt-1">Rebar Fixing 7th Floor delayed by 3 days</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Critical path dependency for Slab Concreting blocked. Project completion at risk of 4-day slippage.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 hover:border-amber-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Inventory Alert</span>
                    <span className="text-[10px] text-slate-400">35m ago</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mt-1">Ready-Mix Concrete below reorder point</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Current stock: 45 m³. Minimum safety buffer: 60 m³. Next pour scheduled in 36 hours.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50 hover:border-blue-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Equipment Status</span>
                    <span className="text-[10px] text-slate-400">2h ago</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-100 mt-1">Tower Crane 01 inspection completed</h4>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Operational clearance renewed for 30 days. No hydraulic anomalies detected.
                  </p>
                </div>
              </div>

              <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
                <button
                  onClick={() => setShowNotificationDrawer(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
