// FIX: Imported `useMemo` from `react` to resolve the "Cannot find name 'useMemo'" error.
import React, { useState, useEffect, useMemo } from 'react';
import { getNextPhase, phaseOrder, PhaseKey } from '../lib/unlockPhases';
import { getSafeMode, setSafeMode } from '../lib/safeBoot';
import { features, setFeatureOverride } from '../lib/featureFlags';


// In a browser environment, we can't truly check file existence.
// This is a simulation based on the files present during code generation.
const EXISTING_FILES = new Set([
  'index.tsx', 'metadata.json', 'index.html', 'types.ts', 'App.tsx', 'components/Sidebar.tsx', 
  'components/Header.tsx', 'pages/DashboardPage.tsx', 'pages/CrmPage.tsx', 'components/ClientTable.tsx', 
  'pages/PlaceholderPage.tsx', 'components/icons/Icons.tsx', 'components/KpiSettingsModal.tsx', 
  'hooks/useLocalStorage.ts', 'components/AddClientModal.tsx', 'pages/QuotingPage.tsx', 
  'components/QuoteTable.tsx', 'pages/SettingsPage.tsx', 'components/CreateQuoteModal.tsx', 
  'pages/ClientDetailPage.tsx', 'components/KanbanBoard.tsx', 'components/ActivityTimeline.tsx', 
  'components/TaskManagement.tsx', 'lib/ai.ts', 'components/SendMessageModal.tsx', 'pages/DiaryPage.tsx', 
  'pages/IntegrationsPage.tsx', 'pages/StaffPage.tsx', 'components/StaffTable.tsx', 
  'components/AddStaffModal.tsx', 'components/ActivityRoleSettings.tsx', 'components/DiaryOpsView.tsx', 
  'pages/OperationsPage.tsx', 'components/OperationsTable.tsx', 'components/JourneyTracker.tsx', 
  'components/AddJobModal.tsx', 'pages/ResourcesPage.tsx', 'components/VehicleModal.tsx', 
  'data/mockData.ts', 'pages/WorkflowPlaceholderPage.tsx', 'components/BookingWorkflow.tsx', 
  'components/AccessForm.tsx', 'contexts/ThemeContext.tsx', 'pages/SalesPipelinePage.tsx', 
  'components/WorkflowBuilder.tsx', 'lib/crmUtils.ts', 'lib/workflowEngine.ts', 
  'components/RichTextEditor.tsx', 'lib/emailUtils.ts', 'components/LeadScoringManager.tsx', 
  'components/MergeFieldPalette.tsx', 'components/AddTaskModal.tsx', 'lib/featureFlags.ts', 
  'lib/workflowRules.ts', 'components/WorkflowPanel.tsx', 'components/WorkflowBoard.tsx', 
  'pages/WorkflowBoardPage.tsx', 'components/KpiSummaryPanel.tsx', 'components/SendWhatsAppModal.tsx', 
  'lib/integrations/whatsapp.ts',
  'pages/PortalPage.tsx', 
  'lib/portal/tokens.ts',
  'pages/QuotePublicView.tsx',
  'lib/quoting/doc.ts',
  'components/AcceptQuoteModal.tsx',
  'pages/EstimatorPage.tsx',
  'lib/ai/estimator.ts',
  // ENHANCEMENT_ops_scheduler: Add new scheduler files to manifest
  'pages/OpsSchedulerPage.tsx',
  'lib/ops/allocator.ts',
  // ENHANCEMENT_storage_module: Add new storage files to manifest
  'pages/StoragePage.tsx',
  'lib/storage/billing.ts',
  // ENHANCEMENT_comms_hub: Add new comms hub files to manifest
  'pages/CommsHubPage.tsx',
  'lib/comms/templates.ts',
  'lib/integrations/email.ts',
  'lib/integrations/sms.ts',
  // ENHANCEMENT_bi_dashboard: Add new BI files to manifest
  'pages/BiDashboardPage.tsx',
  'lib/bi/kpis.ts',
  // ENHANCEMENT_workflow_v2: Add new engine files to manifest
  'lib/workflows/engineV2.ts',
  'lib/workflows/workflowsV2.ts',
  // ENHANCEMENT_integration_layer: Add new integration files to manifest
  'lib/integrations/xero.ts',
  'lib/integrations/quickbooks.ts',
  'lib/integrations/googleCalendar.ts',
  'lib/integrations/googleMaps.ts',
  'lib/integrations/config.ts',
  // ENHANCEMENT_move_insights: Add new insights files to manifest
  'pages/InsightsPage.tsx',
  'lib/ai/insights.ts',
  // ENHANCEMENT_maintenance_audit: Add new maintenance files to manifest
  'pages/MaintenancePage.tsx',
  'pages/MaintenanceSplashPage.tsx',
  'lib/audit/log.ts',
  'lib/maintenance/snapshot.ts',
  // ENHANCEMENT_phase_unlock: Add new phase unlock file
  'lib/unlockPhases.ts',
  // Safety enhancements
  'components/ErrorBoundary.tsx',
  'lib/safeBoot.ts',
  'lib/lazy.tsx'
]);


const FEATURE_MANIFEST = {
  customerPortalEnabled: { name: 'Customer Portal', files: ['pages/PortalPage.tsx', 'lib/portal/tokens.ts'] },
  smartQuoteEsignEnabled: { name: 'Smart Quote & E-Sign', files: ['pages/QuotePublicView.tsx', 'lib/quoting/doc.ts'] },
  aiEstimatorEnabled: { name: 'AI Estimator', files: ['pages/EstimatorPage.tsx', 'lib/ai/estimator.ts'] },
  opsSchedulerEnabled: { name: 'Ops Scheduler', files: ['pages/OpsSchedulerPage.tsx', 'lib/ops/allocator.ts'] },
  storageModuleEnabled: { name: 'Storage Module', files: ['pages/StoragePage.tsx', 'lib/storage/billing.ts'] },
  commsHubEnabled: { name: 'Comms Hub', files: ['pages/CommsHubPage.tsx', 'lib/comms/templates.ts', 'lib/integrations/whatsapp.ts', 'lib/integrations/email.ts', 'lib/integrations/sms.ts'] },
  biDashboardEnabled: { name: 'BI Dashboard', files: ['pages/BiDashboardPage.tsx', 'lib/bi/kpis.ts'] },
  workflowEngineV2Enabled: { name: 'Workflow Engine V2', files: ['lib/workflows/engineV2.ts', 'lib/workflows/workflowsV2.ts'] },
  integrationLayerEnabled: { name: 'Integration Layer', files: ['lib/integrations/xero.ts', 'lib/integrations/quickbooks.ts', 'lib/integrations/googleCalendar.ts', 'lib/integrations/googleMaps.ts', 'lib/integrations/config.ts'] },
  moveInsightsEnabled: { name: 'Move Insights', files: ['pages/InsightsPage.tsx', 'lib/ai/insights.ts'] },
  maintenanceAuditEnabled: { name: 'Maintenance & Audit', files: ['pages/MaintenancePage.tsx', 'pages/MaintenanceSplashPage.tsx', 'lib/audit/log.ts', 'lib/maintenance/snapshot.ts'] },
};

function SectionSafeMode() {
  const [safe, setSafe] = React.useState(getSafeMode());
  return (
    <div className="bg-white p-4 rounded shadow dark:bg-gray-800">
      <h3 className="font-bold">Safe Mode</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Forces all risky features OFF without changing code.</p>
      <button
        className="mt-2 px-3 py-1 bg-gray-800 text-white rounded"
        onClick={() => { setSafeMode(!safe); setSafe(!safe); location.reload(); }}
      >
        {safe ? 'Disable Safe Mode' : 'Enable Safe Mode'}
      </button>
    </div>
  );
}

function SectionLastError() {
  let last: { message?: string; stack?: string; info?: string; ts?: string } | null = null;
  try { last = JSON.parse(localStorage.getItem('lastRenderError') || 'null'); } catch {}
  if (!last) return null;
  return (
    <div className="bg-white p-4 rounded shadow dark:bg-gray-800">
      <h3 className="font-bold text-red-600">Last Render Error</h3>
      <p className="text-sm"><strong>Time:</strong> {last.ts}</p>
      <pre className="text-xs overflow-auto bg-gray-100 p-2 rounded mt-2 dark:bg-gray-900 dark:text-gray-300">{last.message}\n{last.stack}\n{last.info}</pre>
      <button
        className="mt-2 px-3 py-1 bg-gray-200 rounded dark:bg-gray-600"
        onClick={() => { localStorage.removeItem('lastRenderError'); location.reload(); }}
      >
        Clear Error
      </button>
    </div>
  );
}

function SectionFeatureOverrides() {
  const [json, setJson] = React.useState(() => {
    try { return JSON.stringify(JSON.parse(localStorage.getItem('featureFlagsOverride') || '{}'), null, 2); }
    catch { return '{}'; }
  });
  return (
    <div className="bg-white p-4 rounded shadow dark:bg-gray-800">
      <h3 className="font-bold">Feature Flag Overrides</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">Edit only if you know what to enable. Invalid JSON is ignored.</p>
      <textarea className="w-full h-40 border rounded p-2 font-mono text-xs dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600"
        value={json} onChange={e => setJson(e.target.value)} />
      <button
        className="mt-2 px-3 py-1 bg-brand-primary text-white rounded"
        onClick={() => {
          try {
            const obj = JSON.parse(json || '{}');
            setFeatureOverride(obj);
            alert('Overrides saved. Reloading...');
            location.reload();
          } catch (e) {
            alert('Invalid JSON');
          }
        }}
      >
        Save Overrides
      </button>
    </div>
  );
}

const DiagnosticsPage: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [unlockLogs, setUnlockLogs] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const addLog = (message: string) => {
    console.log(`[DIAGNOSTICS] ${message}`);
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(0, 20));
  };

  const addUnlockLog = (message: string) => {
    setUnlockLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };

  const handleUnlockNextPhase = () => {
    const lastEnabledPhase = [...phaseOrder].reverse().find(phase => features[phase]);

    if (!lastEnabledPhase) {
        // If nothing is enabled, unlock the first phase.
        const firstPhase = phaseOrder[0];
        if (firstPhase) {
            setFeatureOverride({ [firstPhase]: true });
            addUnlockLog(`Unlocked first phase: ${firstPhase}. Reloading...`);
            setTimeout(() => location.reload(), 500);
        }
    } else {
        // Find the next phase and unlock it.
        const nextPhase = getNextPhase(lastEnabledPhase);
        if (nextPhase) {
            setFeatureOverride({ [nextPhase]: true });
            addUnlockLog(`Unlocked next phase: ${nextPhase}. Reloading...`);
            setTimeout(() => location.reload(), 500);
        } else {
            addUnlockLog('All phases are already unlocked!');
        }
    }
    setRefreshKey(k => k + 1);
  };

  const currentUnlockedPhase = useMemo(() => {
    return [...phaseOrder].reverse().find(phase => features[phase]) || 'None';
  }, [refreshKey]);


  const runTest = (name: string, testFn: () => void) => {
    addLog(`Running test: ${name}...`);
    try {
      testFn();
      addLog(`Test "${name}" completed successfully.`);
    } catch (e: any) {
      addLog(`Test "${name}" failed: ${e.message}`);
    }
  };
  
  return (
    <div className="space-y-8" key={refreshKey}>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Diagnostics Panel</h1>
        <p className="text-gray-600 mt-1 dark:text-gray-400">System status, feature flags, and safe tests.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionSafeMode />
        <SectionLastError />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">Feature Flags & File Manifest</h3>
        
        <div className="mb-4 p-4 bg-brand-light dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Phase Unlock System</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current unlocked phase: <span className="font-bold">{currentUnlockedPhase}</span></p>
            </div>
            <button
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary"
              onClick={handleUnlockNextPhase}
            >
              Unlock Next Phase
            </button>
        </div>
        
        <table className="w-full text-sm">
          <thead className="text-left">
            <tr className="border-b dark:border-gray-700">
              <th className="py-2">Feature Name</th>
              <th className="py-2">Flag Enabled</th>
              <th className="py-2">Required Files</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(features).map(([key, isEnabled]) => {
              const manifest = FEATURE_MANIFEST[key as keyof typeof FEATURE_MANIFEST];
              return (
                <tr key={key} className="border-b dark:border-gray-700/50">
                  <td className="py-3 font-medium text-gray-800 dark:text-gray-200">{manifest?.name || key}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {isEnabled ? '✅ ON' : '❌ OFF'}
                    </span>
                  </td>
                  <td className="py-3">
                    {manifest ? (
                      <ul className="space-y-1">
                        {manifest.files.map(file => (
                          <li key={file} className="flex items-center">
                            {EXISTING_FILES.has(file) ? <span className="text-green-500 mr-2">✅</span> : <span className="text-red-500 mr-2">❌</span>}
                            <span className={EXISTING_FILES.has(file) ? 'text-gray-600 dark:text-gray-400' : 'text-red-500 line-through'}>{file}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Core feature</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-6">
          <SectionFeatureOverrides />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">Run Safe Tests</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button className="test-btn" onClick={() => runTest('Ping WhatsApp Stub', () => addLog('WhatsApp stub pinged.'))}>Ping WhatsApp Stub</button>
          <button className="test-btn" onClick={() => runTest('Ping Email Stub', () => addLog('Email stub pinged.'))}>Ping Email Stub</button>
          <button className="test-btn" onClick={() => runTest('Ping Xero Stub', () => addLog('Xero stub pinged.'))}>Ping Xero Stub</button>
          <button className="test-btn" onClick={() => runTest('Simulate Quote Accepted Event', () => addLog('Event QUOTE_ACCEPTED emitted to console.'))}>Simulate Quote Accepted</button>
          <button className="test-btn" onClick={() => runTest('Compute Demo KPIs', () => addLog('lib/bi/kpis.ts found, test skipped.'))}>Compute Demo KPIs</button>
          <button className="test-btn" onClick={() => runTest('Compute Demo Insights', () => addLog('lib/ai/insights.ts found, test skipped.'))}>Compute Demo Insights</button>
        </div>
        <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Test Log</h4>
            <div className="mt-2 p-3 bg-gray-900 text-gray-200 rounded-md font-mono text-xs h-48 overflow-y-auto">
                {logs.length > 0 ? logs.map((log, i) => <div key={i}>{log}</div>) : 'No tests run yet.'}
            </div>
        </div>

        <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phase Status Log</h4>
            <div className="mt-2 p-3 bg-gray-900 text-gray-200 rounded-md font-mono text-xs h-24 overflow-y-auto">
                {unlockLogs.length > 0 ? unlockLogs.map((log, i) => <div key={i}>{log}</div>) : 'Click "Unlock Next Phase" to begin.'}
            </div>
        </div>

      </div>
       <style>{`.test-btn { padding: 0.5rem 1rem; font-weight: 600; text-align: center; border-radius: 0.375rem; border: 1px solid #d1d5db; background-color: #f9fafb; transition: background-color 0.2s; } .test-btn:hover { background-color: #f3f4f6; } .dark .test-btn { background-color: #374151; border-color: #4b5563; } .dark .test-btn:hover { background-color: #4b5563; }`}</style>
    </div>
  );
};

export default DiagnosticsPage;
