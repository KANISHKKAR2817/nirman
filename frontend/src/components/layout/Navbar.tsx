import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { Role } from '../../types';
import {
  Building2,
  Sun,
  Moon,
  Bell,
  Search,
  Clock,
  Sparkles,
  ChevronDown,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Presentation
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

interface NavbarProps {
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, unreadNotificationsCount = 4 }) => {
  const { user, switchDemoUser } = useAuth();
  const { currentProject, projects, setCurrentProject, triggerRefresh, isBackendConnected } = useProject();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [timeStr, setTimeStr] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickRecalculate = async () => {
    try {
      setIsRecalculating(true);
      if (currentProject) {
        await api.recalculateRisk(currentProject.id);
        triggerRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left: Project Selector & Logo Mobile */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-construction-600 to-construction-800 flex items-center justify-center text-white shadow-md shadow-construction-950/40 group-hover:scale-105 transition-transform">
            <Building2 className="w-5 h-5 text-construction-200" />
          </div>
          <div className="hidden sm:block">
            <span className="tracking-wider font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-construction-400">
              NIRMAN
            </span>
            <span className="text-[10px] font-medium text-slate-400 block -mt-1 tracking-tight">
              3D Digital Twin Platform
            </span>
          </div>
        </Link>

        {/* Project Selector */}
        <div className="relative hidden md:flex items-center">
          <div className="h-4 w-px bg-slate-800 mx-2" />
          <select
            value={currentProject?.id || 1}
            onChange={(e) => {
              const p = projects.find((proj) => proj.id === Number(e.target.value));
              if (p) setCurrentProject(p);
            }}
            className="bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 py-1.5 px-3 rounded-md border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-construction-500 cursor-pointer transition-colors max-w-xs truncate"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.code} — {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Search & Status Indicators */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search zones, tasks, equipment, materials..."
            className="bg-slate-950/70 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-4 py-1.5 rounded-full border border-slate-800 focus:outline-none focus:border-construction-500 w-72 transition-all"
          />
        </div>

        {/* Live Site Clock */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-md font-mono">
          <Clock className="w-3.5 h-3.5 text-construction-400" />
          <span>{timeStr}</span>
        </div>

        {/* Backend Connectivity Status */}
        <div
          className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium ${
            isBackendConnected
              ? 'bg-construction-950/40 text-construction-400 border-construction-800/60'
              : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
          }`}
          title={isBackendConnected ? 'Backend Connected' : 'Local Fallback Mode'}
        >
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-construction-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isBackendConnected ? 'API Live (8080)' : 'Syncing'}</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, User Menu, Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {/* Recalculate Risk Quick Button */}
        <button
          onClick={handleQuickRecalculate}
          disabled={isRecalculating}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-construction-300 border border-construction-600/30 px-2.5 py-1.5 rounded-md transition-colors"
          title="Trigger deterministic rule-based risk recalculation"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-construction-400' : ''}`} />
          <span>Re-score Risks</span>
        </button>

        {/* Hackathon Judge Walkthrough Button */}
        <button
          onClick={() => navigate('/presentation')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-construction-700 to-emerald-600 hover:from-construction-600 hover:to-emerald-500 text-white px-2.5 py-1.5 rounded-md shadow-sm transition-all"
        >
          <Presentation className="w-3.5 h-3.5 text-emerald-200" />
          <span className="hidden md:inline">Judge Demo Mode</span>
        </button>

        {/* Notifications Bell */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Notifications and Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Demo User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-800 text-left transition-colors border border-slate-800"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-construction-300 border border-slate-600">
              {user?.fullName.charAt(0) || 'U'}
            </div>
            <div className="hidden xl:block text-xs">
              <div className="font-semibold text-slate-200 leading-tight">{user?.fullName || 'Demo User'}</div>
              <div className="text-[10px] text-construction-400 uppercase tracking-wider font-mono">
                {user?.role?.replace('_', ' ') || 'PROJECT MANAGER'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-900 border border-slate-700 shadow-xl shadow-black/60 py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 font-medium">
                Switch Demo Persona:
              </div>
              {(['PROJECT_MANAGER', 'SITE_ENGINEER', 'SAFETY_OFFICER', 'ADMIN'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchDemoUser(r);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                    user?.role === r ? 'text-construction-400 font-semibold bg-slate-800/60' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div className="capitalize">{r.toLowerCase().replace('_', ' ')}</div>
                    <div className="text-[10px] text-slate-500">
                      {r === 'PROJECT_MANAGER' && 'Rajesh Sharma'}
                      {r === 'SITE_ENGINEER' && 'Aakash Patel'}
                      {r === 'SAFETY_OFFICER' && 'Harpreet Singh'}
                      {r === 'ADMIN' && 'Vikramaditya Rao'}
                    </div>
                  </div>
                  {user?.role === r && <UserCheck className="w-3.5 h-3.5 text-construction-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
