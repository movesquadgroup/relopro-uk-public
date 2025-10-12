/* KEEP your existing export keys as-is, but wrap them with a loader */
type Flags = typeof featuresDefault;

export const featuresDefault = {
  // keep existing flags & their current defaults
  aiLeadScoringEnabled: true,
  aiSummariesEnabled: true,
  aiNbaEnabled: true,
  dataHygieneEnabled: false,
  semanticSearchEnabled: false,

  // Ops Scheduler hard kill-switch
  opsSchedulerEnabled: false,
  opsDragAndDropEnabled: false, // legacy flag; keep false

  // Phase features (even if not used yet)
  customerPortalEnabled: false,
  smartQuoteEsignEnabled: false,
  aiEstimatorEnabled: false,
  storageModuleEnabled: false,
  commsHubEnabled: false,
  biDashboardEnabled: false,
  workflowEngineV2Enabled: false,
  integrationLayerEnabled: false,
  moveInsightsEnabled: false,
  maintenanceAuditEnabled: true
};

// Merge defaults with localStorage overrides; freeze result.
function loadOverrides(): Partial<Flags> {
  try {
    const raw = localStorage.getItem('featureFlagsOverride');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

import { getSafeMode } from './safeBoot';

function computeFeatures(): Flags {
  const base: Flags = { ...featuresDefault } as Flags;

  if (getSafeMode()) {
    // In Safe Mode, only allow the absolutely safe flags:
    const allowed = new Set<string>([
      'maintenanceAuditEnabled' // diagnostics/audit only
    ]);
    for (const k of Object.keys(base)) {
      if (!allowed.has(k)) (base as any)[k] = false;
    }
    return Object.freeze(base) as Flags;
  }

  const overrides = loadOverrides();
  const merged: any = { ...base, ...overrides };
  return Object.freeze(merged) as Flags;
}

// Export computed, immutable flags object
export const features: Flags = computeFeatures();

export function setFeatureOverride(partial: Partial<Flags>) {
  try {
    const current = loadOverrides();
    localStorage.setItem('featureFlagsOverride', JSON.stringify({ ...current, ...partial }));
  } catch {}
}