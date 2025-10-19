import React, { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Client, Quote } from '../types';
import { features } from '../lib/featureFlags';
import { lazyIfEnabled, safeImport } from '../lib/lazy';

const KpiSummaryPanel = lazyIfEnabled(
  features.biDashboardEnabled,
  () => safeImport('../components/KpiSummaryPanel'),
  <div className="text-center p-4 text-gray-500">BI Dashboard feature not enabled.</div>
);

const SendWhatsAppModal = lazyIfEnabled(
  features.commsHubEnabled,
  () => safeImport('../components/SendWhatsAppModal')
);


// FIX: Exported the Kpi interface, which was missing. This resolves the TypeScript error in KpiSettingsModal.tsx, which imports this type.
export interface Kpi {
  id: string;
  title: string;
}

/**
 * DashboardPage
 * - Shows KPI Summary Panel at the top (clean, visible, no sr-only).
 * - Adds a simple Quick Actions card with a WhatsApp button (opens modal).
 * - Includes a robust KPI refresh strategy:
 *    1) Manual trigger: call `window.dispatchEvent(new Event('kpi:refresh'))` from anywhere.
 *    2) Cross-tab updates: listens to `storage` events for core keys and refreshes KPIs.
 *    3) Local optimistic updates: if this page changes relevant data in the future, call setRefreshKey(k => k+1).
 */

const DashboardPage: React.FC = () => {
  // Local data (used for smart defaults in the WhatsApp modal & to detect if there’s any data)
  const [clients] = useLocalStorage<Client[]>('clients', []);
  const [quotes] = useLocalStorage<Quote[]>('quotes', []);

  // --- BONUS: Auto-refresh key to force KpiSummaryPanel re-render when data changes elsewhere ---
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for cross-tab storage changes that affect KPIs
  useEffect(() => {
    const interestingKeys = new Set(['clients', 'quotes', 'diaryEvents', 'invoices', 'jobs', 'payments']);
    const onStorage = (e: StorageEvent) => {
      if (e.key && interestingKeys.has(e.key)) {
        setRefreshKey(k => k + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Lightweight custom event so other parts of the app can request a KPI refresh without touching state directly
  useEffect(() => {
    const onKpiRefresh = () => setRefreshKey(k => k + 1);
    window.addEventListener('kpi:refresh', onKpiRefresh as EventListener);
    return () => window.removeEventListener('kpi:refresh', onKpiRefresh as EventListener);
  }, []);

  // --- WhatsApp Modal wiring ---
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Pick a “likely” target for the default WhatsApp message (most recent lead/quoted, falling back to any client)
  const defaultClient = useMemo(() => {
    if (!clients || clients.length === 0) return undefined;
    // Prefer the newest client by createdAt if present
    const sorted = [...clients].sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
    return sorted[0];
  }, [clients]);

  const defaultQuote = useMemo(() => {
    if (!quotes || quotes.length === 0) return undefined;
    // Prefer latest quote for the default client
    const byClient = defaultClient ? quotes.filter(q => q.clientId === defaultClient.id) : quotes;
    const sorted = [...byClient].sort((a, b) =>
      (b.quoteDate || '').localeCompare(a.quoteDate || '')
    );
    return sorted[0];
  }, [quotes, defaultClient]);

  const defaultWhatsAppText = useMemo(() => {
    const clientName = defaultClient?.name || 'there';
    const qId = defaultQuote?.id ? ` (#${defaultQuote.id})` : '';
    return `Hi ${clientName}, just a quick follow-up regarding your quotation${qId}. Do you have any questions or would you like us to proceed?`;
  }, [defaultClient, defaultQuote]);

  const defaultWhatsAppNumber = useMemo(() => defaultClient?.phone || '', [defaultClient]);

  return (
    <div className="space-y-6">
      {/* KPI Summary Panel at top */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Key Metrics
          </h2>

          {/* Optional small button to force-refresh KPIs on demand */}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            aria-label="Refresh key metrics"
          >
            Refresh
          </button>
        </div>
        <div className="mt-3">
          {features.biDashboardEnabled && <KpiSummaryPanel key={refreshKey} />}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Quick Actions
        </h3>

        <div className="flex flex-wrap gap-2">
          {features.commsHubEnabled && (
            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors"
            >
              Message via WhatsApp
            </button>
          )}

          {/* You can add more safe quick actions here later without altering design */}
        </div>
      </div>

      {/* Your existing dashboard content goes here */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Overview
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Welcome back. Use the quick actions above or explore your KPIs. This section can include your existing cards, tables, or workflow panels.
        </p>
      </div>

      {/* WhatsApp modal (opens with sensible defaults) */}
      {features.commsHubEnabled && isWhatsAppOpen && (
        <SendWhatsAppModal
          isOpen={isWhatsAppOpen}
          onClose={() => setIsWhatsAppOpen(false)}
          // These props assume the modal we added earlier; if your modal uses different prop names, adjust here.
          defaultTo={defaultWhatsAppNumber}
          defaultMessage={defaultWhatsAppText}
          // Optional: let the modal hint which client/quote we prefilled
          context={{
            clientId: defaultClient?.id,
            clientName: defaultClient?.name,
            quoteId: defaultQuote?.id,
          }}
          // When a message is sent successfully, bump KPIs if you track “engagement”/“touches”
          onSent={() => {
            setIsWhatsAppOpen(false);
            // If sending should affect KPIs in your setup, trigger a refresh:
            setRefreshKey(k => k + 1);
            // also let other tabs know if needed:
            window.dispatchEvent(new Event('kpi:refresh'));
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
