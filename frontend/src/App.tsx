import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { Layout } from './components/layout/Layout';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { WorkersPage } from './pages/WorkersPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { RiskSafetyPage } from './pages/RiskSafetyPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { BudgetPage } from './pages/BudgetPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { PresentationPage } from './pages/PresentationPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="digital-twin" element={<DigitalTwinPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="workers" element={<WorkersPage />} />
                <Route path="equipment" element={<EquipmentPage />} />
                <Route path="materials" element={<MaterialsPage />} />
                <Route path="risk-safety" element={<RiskSafetyPage />} />
                <Route path="simulator" element={<SimulatorPage />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="audit-trail" element={<AuditTrailPage />} />
                <Route path="presentation" element={<PresentationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
