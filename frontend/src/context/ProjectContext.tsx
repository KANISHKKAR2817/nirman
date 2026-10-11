import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  setCurrentProject: (project: Project) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  isLoading: boolean;
  isBackendConnected: boolean;
}

const DEFAULT_FALLBACK_PROJECT: Project = {
  id: 1,
  name: 'NIRMAN Smart Residential Tower',
  code: 'NIRMAN-SRT-01',
  description: 'G+14 Premium Residential Twin Tower with Integrated Sustainable BIM Infrastructure',
  siteAddress: 'Plot 42, Cyber City Tech Corridor, Bangalore 560100',
  client: 'Apex Urban Developers Ltd',
  projectManager: 'Rajesh Sharma',
  startDate: '2026-01-15',
  plannedCompletionDate: '2026-12-25',
  totalBudget: 85000000,
  status: 'ACTIVE',
  progressPercentage: 48.5,
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([DEFAULT_FALLBACK_PROJECT]);
  const [currentProject, setCurrentProject] = useState<Project | null>(DEFAULT_FALLBACK_PROJECT);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);

  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      if (data && data.length > 0) {
        setProjects(data);
        setCurrentProject((prev) => (prev ? data.find((p) => p.id === prev.id) || data[0] : data[0]));
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Backend currently unreachable, using active project memory:', err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProjects();
    }
  }, [authLoading, token, refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        setCurrentProject,
        refreshTrigger,
        triggerRefresh,
        isLoading,
        isBackendConnected,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
