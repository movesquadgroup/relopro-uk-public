import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import JourneyWizardPage from './pages/JourneyWizardPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import CrmPage from './pages/CrmPage';
import ClientDetailPage from './pages/ClientDetailPage';
import PlaceholderPage from './pages/PlaceholderPage';
import QuotingPage from './pages/QuotingPage';
import SettingsPage from './pages/SettingsPage';
import DiaryPage from './pages/DiaryPage';
import IntegrationsPage from './pages/IntegrationsPage';
import OperationsPage from './pages/OperationsPage';
import ResourcesPage from './pages/ResourcesPage';
import WorkflowPlaceholderPage from './pages/WorkflowPlaceholderPage';
import WorkflowBoardPage from './pages/WorkflowBoardPage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import FeatureStubPage from './pages/FeatureStubPage';
import { features } from './lib/featureFlags';
import PortalPage from './pages/PortalPage';
import QuotePublicView from './pages/QuotePublicView';
import EstimatorPage from './pages/EstimatorPage';
import OpsSchedulerPage from './pages/OpsSchedulerPage';
import StoragePage from './pages/StoragePage';
import CommsHubPage from './pages/CommsHubPage';
import BiDashboardPage from './pages/BiDashboardPage';
import InsightsPage from './pages/InsightsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import MaintenanceSplashPage from './pages/MaintenanceSplashPage';
import MaintenancePage from './pages/MaintenancePage';
import { getSafeMode } from './lib/safeBoot';
import AdminCloudStatusPage from './pages/AdminCloudStatusPage';
import LiveChatWidget from './components/LiveChatWidget';
import JourneyDebuggerPage from './pages/JourneyDebuggerPage';

const App: React.FC = () => {
  const [isMaintenanceMode] = useLocalStorage<boolean>('isMaintenanceMode', false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const location = useLocation();

  if (isMaintenanceMode && location.pathname !== '/admin/maintenance') {
    return <MaintenanceSplashPage />;
  }

  return (
    <>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {getSafeMode() && (
            <div className="bg-yellow-200 text-yellow-900 text-center py-1 text-sm font-medium">
              SAFE MODE ACTIVE – risky features disabled
            </div>
          )}
          <Header onToggleLiveChat={() => setIsLiveChatOpen(prev => !prev)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/crm" element={<CrmPage />} />
                <Route path="/crm/:clientId" element={<ClientDetailPage />} />
                <Route path="/survey" element={<PlaceholderPage title="Survey (MoveIQ)" />} />
                <Route path="/operations" element={<OperationsPage />} />
                <Route path="/workflow" element={<WorkflowBoardPage />} />
                <Route 
                  path="/costing" 
                  element={<WorkflowPlaceholderPage 
                    title="Costing Workflow" 
                    steps={["Volume & Distance Calculation", "Labor Estimation", "Material Costs", "Generate Cost Price"]}
                  />} 
                />
                <Route path="/quoting" element={<QuotingPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                {/* ENHANCEMENT_storage_module: Route for Storage Module */}
                <Route path="/storage" element={<StoragePage />} />
                <Route path="/diary" element={<DiaryPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* ENHANCEMENT_customer_portal: Route for Customer Portal */}
                <Route path="/portal" element={<PortalPage />} />
                {/* ENHANCEMENT_smart_quote_esign: Route for Public Quote View */}
                <Route path="/quote/:id/public" element={<QuotePublicView />} />
                {/* ENHANCEMENT_ai_estimator: Route for AI Estimator */}
                <Route path="/estimator" element={<EstimatorPage />} />
                {/* ENHANCEMENT_ops_scheduler: Route for Ops Scheduler removed */}
                <Route path="/ops-scheduler" element={<Navigate to="/operations" replace />} />
                {/* ENHANCEMENT_comms_hub: Route for Comms Hub */}
                <Route path="/comms" element={<CommsHubPage />} />
                {/* ENHANCEMENT_bi_dashboard: Route for BI Dashboard */}
                <Route path="/bi" element={<BiDashboardPage />} />
                {/* ENHANCEMENT_move_insights: Route for Move Insights */}
                <Route path="/insights" element={<InsightsPage />} />
                {/* ENHANCEMENT_maintenance_audit: Route for Maintenance Page */}
                <Route path="/admin/maintenance" element={<MaintenancePage />} />
                <Route path="/admin/cloud-status" element={<AdminCloudStatusPage />} />
                <Route path="/diagnostics" element={<DiagnosticsPage />} />
                {/* END ENHANCEMENT */}
              
        <Route path="/journey-debugger" element={<JourneyDebuggerPage />} />
        <Route path="admin/journey-wizard" element={<JourneyWizardPage/>} />
</Routes>
            </div>
          </main>
        </div>
      </div>
      <LiveChatWidget isOpen={isLiveChatOpen} onClose={() => setIsLiveChatOpen(false)} />
    </>
  );
};

export default App;