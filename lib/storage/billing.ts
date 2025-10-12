// ENHANCEMENT_storage_module: Logic for recurring billing

import { StorageUnit, RecurringInvoice } from '../../types';

/**
 * Generates the next recurring invoice for a storage unit.
 * In a real system, this would be run by a cron job.
 * @param unit The storage unit to generate an invoice for.
 * @returns A new RecurringInvoice object.
 */
export function generateNextInvoice(unit: StorageUnit): RecurringInvoice {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 14); // Due in 14 days

    console.log(`[BILLING STUB] Generating invoice for ${unit.id} for client ${unit.clientId}`);

    return {
        id: `inv-storage-${unit.id}-${Date.now()}`,
        storageUnitId: unit.id,
        clientId: unit.clientId,
        issueDate: today.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        amount: unit.monthlyRate,
        status: 'Draft',
    };
}