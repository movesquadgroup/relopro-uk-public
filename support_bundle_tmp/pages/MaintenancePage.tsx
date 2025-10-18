import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { addAuditLog, useAuditLog } from '../lib/audit/log';
import { createSnapshot, getSnapshots, rollbackToSnapshot } from '../lib/maintenance/snapshot';
import { SystemSnapshot } from '../types';
import { WarningIcon } from '../components/icons/Icons';

const MaintenancePage: React.FC = () => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useLocalStorage<boolean>('isMaintenanceMode', false);
    const [auditLog] = useAuditLog();
    const [snapshots, setSnapshots] = useState<SystemSnapshot[]>([]);

    useEffect(() => {
        setSnapshots(getSnapshots());
    }, []);

    const handleToggleMaintenanceMode = (enabled: boolean) => {
        setIsMaintenanceMode(enabled);
        addAuditLog(enabled ? 'ENABLED_MAINTENANCE_MODE' : 'DISABLED_MAINTENANCE_MODE');
    };

    const handleCreateSnapshot = () => {
        createSnapshot();
        setSnapshots(getSnapshots()); // Refresh the list
    };

    const handleRollback = (snapshotId: string) => {
        try {
            rollbackToSnapshot(snapshotId);
            // The page will reload on success, so no need to update state here.
        } catch (error) {
            alert((error as Error).message);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Maintenance & Audit</h1>
                <p className="text-gray-600 mt-1 dark:text-gray-400">Manage system state, create backups, and review critical logs.</p>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Maintenance Mode</h3>
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        When enabled, all users will see a maintenance page. Only this admin panel will be accessible.
                    </p>
                    <label htmlFor="maintenance-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                id="maintenance-toggle"
                                type="checkbox"
                                className="sr-only"
                                checked={isMaintenanceMode}
                                onChange={(e) => handleToggleMaintenanceMode(e.target.checked)}
                            />
                            <div className={`block w-14 h-8 rounded-full ${isMaintenanceMode ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isMaintenanceMode ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>

            {/* Snapshots */}
            <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">System Snapshots</h3>
                    <button onClick={handleCreateSnapshot} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary">
                        Create New Snapshot
                    </button>
                </div>
                <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Create a point-in-time backup of all application data. You can roll back to a snapshot if needed.</p>
                <div className="space-y-3">
                    {snapshots.map(snapshot => (
                        <div key={snapshot.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">Snapshot from {new Date(snapshot.timestamp).toLocaleString()}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">ID: {snapshot.id}</p>
                            </div>
                            <button onClick={() => handleRollback(snapshot.id)} className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200">
                                <WarningIcon />
                                <span>Rollback</span>
                            </button>
                        </div>
                    ))}
                    {snapshots.length === 0 && <p className="text-center text-gray-400 italic py-4">No snapshots created yet.</p>}
                </div>
            </div>

            {/* Audit Log */}
            <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">Audit Log</h3>
                <div className="p-3 bg-gray-900 text-gray-200 rounded-md font-mono text-xs h-64 overflow-y-auto">
                    {auditLog.map(log => (
                        <div key={log.id} className="whitespace-pre-wrap">
                            <span className="text-gray-500">{new Date(log.timestamp).toLocaleString()}:</span>
                            <span className="text-cyan-400"> [{log.author}]</span>
                            <span className="text-yellow-400"> {log.action}</span>
                            {log.details && <span className="text-gray-300"> - {log.details}</span>}
                        </div>
                    ))}
                    {auditLog.length === 0 && <span className="text-gray-500">No audit events recorded yet.</span>}
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;