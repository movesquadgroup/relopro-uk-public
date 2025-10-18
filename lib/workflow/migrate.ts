/**
 * Safe no-op migration to keep the app stable.
 * Replace with real logic later; this just runs once and sets a flag.
 */
export async function migrateExistingClientsToOrders(): Promise<void> {
  try {
    const FLAG = 'migrated_clients_to_orders_v1';
    if (typeof window !== 'undefined' && window?.localStorage?.getItem(FLAG) === 'yes') {
      return;
    }
    // TODO: add real migration steps here when ready
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.setItem(FLAG, 'yes');
    }
    console.log('[migrate] no-op migration completed');
  } catch (err) {
    console.warn('[migrate] skipped due to error:', err);
  }
}
