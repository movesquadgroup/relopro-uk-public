// ENHANCEMENT_maintenance_audit: Logic for creating and retrieving audit logs.

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AuditLog } from '../../types';

export const useAuditLog = () => {
    return useLocalStorage<AuditLog[]>('auditLog', []);
};

/**
 * Adds a new entry to the audit log.
 * @param action A short, uppercase string identifying the action (e.g., 'ENABLED_MAINTENANCE_MODE').
 * @param details Optional descriptive text about the event.
 */
export const addAuditLog = (action: string, details?: string) => {
    const logEntry: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        author: 'John Doe (Admin)', // In a real app, this would be the logged-in user.
        action,
        details,
    };

    // We manually update localStorage here to avoid potential hook-related race conditions
    // and to ensure the log is written immediately.
    const currentLogs = JSON.parse(localStorage.getItem('auditLog') || '[]') as AuditLog[];
    const newLogs = [logEntry, ...currentLogs].slice(0, 100); // Keep the latest 100 entries
    localStorage.setItem('auditLog', JSON.stringify(newLogs));
    
    // Dispatch a custom event that hooks like useLocalStorage can listen for to update their state.
    // This ensures UI components refresh when a log is added from a non-component context.
    window.dispatchEvent(new Event('storage'));
};
