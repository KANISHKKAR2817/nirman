import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Project, Milestone } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  FolderGit2,
  Plus,
  Search,
  Calendar,
  Building,
  User,
  IndianRupee,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectsPage: React.FC = () => {
  const { currentProject, setCurrentProject, projects, triggerRefresh } = useProject();
  const [projectList, setProjectList] = useState<Project[]>(projects);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    code: '',
    description: '',
    siteAddress: '',
    client: '',
    projectManager: '',
    startDate: '2026-03-01',
    plannedCompletionDate: '2027-04-30',
    totalBudget: 95000000,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.getProjects();
        if (res && res.length > 0) setProjectList(res);
      } catch (err) {
        console.warn('Projects fallback:', err);
      }
    };
    fetchAll();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.createProject({
        ...newProject,
        status: 'ACTIVE',
        progressPercentage: 0,
      });
      setProjectList((prev) => [...prev, created]);
      setCurrentProject(created);
      setIsCreateModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to create project:', err);
      // Local optimistic addition for smooth UX
      const fallback: Project = {
        id: Date.now(),
        ...newProject,
        status: 'ACTIVE',
        progressPercentage: 0,
      };
      setProjectList((prev) => [...prev, fallback]);
      setCurrentProject(fallback);
      setIsCreateModalOpen(false);
    }
  };

  const filtered = projectList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.client && p.client.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-emerald-500" />
            Capital Projects Portfolio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise construction undertakings, BIM metadata, contract scope, and milestone governance.
          </p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Create New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by name, code, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select-field sm:w-48"
        >
          <option value="ALL">All Project Statuses</option>
          <option value="ACTIVE">Active Construction</option>
          <option value="PLANNING">Planning & Pre-Con</option>
          <option value="COMPLETED">Commissioned / Completed</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((proj) => {
          const isSelected = currentProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              className={`panel-card p-5 relative flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-emerald-500/80 shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                    {proj.code}
                  </span>
                  <Badge variant={proj.status === 'ACTIVE' ? 'success' : 'neutral'} size="sm">
                    {proj.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-white mt-3 line-clamp-1">{proj.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Construction Progress</span>
                    <span className="text-emerald-400 font-mono">{proj.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${proj.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Key Attributes */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{proj.client || 'Apex Urban Developers'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Lead PM: {proj.projectManager || 'Rajesh Sharma'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">
                      Budget: ₹{(proj.totalBudget / 10000000).toFixed(2)} Cr
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-400">
                      {proj.startDate} to {proj.plannedCompletionDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setCurrentProject(proj)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? '✓ Active In Twin' : 'Set as Current Project'}
                </button>
                <Link
                  to="/digital-twin"
                  onClick={() => setCurrentProject(proj)}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  3D View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Project */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Initialize New Construction Project"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Project Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. NIRMAN Tech Park Phase 2"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Project Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. NTP-BLR-02"
                value={newProject.code}
                onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                className="input-field uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              Project Description / BIM Scope
            </label>
            <textarea
              rows={2}
              placeholder="Commercial Grade A office tower with 18 floors and 3 basements..."
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Client / Developer
              </label>
              <input
                type="text"
                value={newProject.client}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Assigned Project Manager
              </label>
              <input
                type="text"
                value={newProject.projectManager}
                onChange={(e) => setNewProject({ ...newProject, projectManager: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newProject.startDate}
                onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Target Completion
              </label>
              <input
                type="date"
                value={newProject.plannedCompletionDate}
                onChange={(e) =>
                  setNewProject({ ...newProject, plannedCompletionDate: e.target.value })
                }
                className="input-field"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Total Budget (₹)
              </label>
              <input
                type="number"
                value={newProject.totalBudget}
                onChange={(e) =>
                  setNewProject({ ...newProject, totalBudget: Number(e.target.value) })
                }
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
              Initialize Project Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
