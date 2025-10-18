// ENHANCEMENT_maintenance_audit: Logic for creating and restoring system snapshots.

import { SystemSnapshot } from '../../types';
import { addAuditLog } from '../audit/log';

const SNAPSHOT_KEY = 'systemSnapshots';

// Define all keys that represent our core application state in localStorage.
const KEYS_TO_SNAPSHOT = [
    'clients', 'quotes', 'diaryEvents', 'staff', 'vehicles', 
    'storageUnits', 'workflows', 'emailTemplates', 'smsTemplates', 
    'whatsAppTemplates', 'leadScoreSettings', 'moveOrders', 'messages',
    'activityRoles', 'tariffs', 'companyProfile'
];

/**
 * Retrieves all stored snapshots.
 * @returns An array of SystemSnapshot objects.
 */
export const getSnapshots = (): SystemSnapshot[] => {
    try {
        const raw = localStorage.getItem(SNAPSHOT_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * Creates a snapshot of the current application state.
 * @returns The newly created SystemSnapshot object.
 */
export const createSnapshot = (): SystemSnapshot => {
    const data: Record<string, any> = {};
    KEYS_TO_SNAPSHOT.forEach(key => {
        data[key] = localStorage.getItem(key); // Store the raw string value (or null)
    });

    const newSnapshot: SystemSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toISOString(),
        data,
    };

    const snapshots = getSnapshots();
    // Keep a maximum of 10 snapshots for simplicity
    const newSnapshots = [newSnapshot, ...snapshots].slice(0, 10); 
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(newSnapshots));
    
    addAuditLog('CREATED_SNAPSHOT', `Created snapshot ID ${newSnapshot.id}`);

    return newSnapshot;
};

/**
 * Rolls the application state back to a selected snapshot.
 * @param snapshotId The ID of the snapshot to restore.
 * @returns A boolean indicating if the rollback was initiated.
 */
export const rollbackToSnapshot = (snapshotId: string): boolean => {
    const snapshots = getSnapshots();
    const snapshotToRestore = snapshots.find(s => s.id === snapshotId);

    if (!snapshotToRestore) {
        throw new Error('Snapshot not found.');
    }

    if (!window.confirm(`Are you sure you want to roll back all system data to the snapshot from ${new Date(snapshotToRestore.timestamp).toLocaleString()}? This action cannot be undone and will reload the application.`)) {
        return false;
    }

    // Restore the data
    Object.entries(snapshotToRestore.data).forEach(([key, value]) => {
        if (value === null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    });

    addAuditLog('PERFORMED_ROLLBACK', `Rolled back to snapshot ${snapshotId} from ${new Date(snapshotToRestore.timestamp).toLocaleString()}`);
    
    // Hard reload the page to ensure all components re-fetch from the restored localStorage
    // and re-initialize their state.
    window.location.reload();

    return true;
};
