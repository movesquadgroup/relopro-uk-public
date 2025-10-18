import { features } from './featureFlags';

export type PhaseKey =
  | 'customerPortalEnabled'
  | 'smartQuoteEsignEnabled'
  | 'aiEstimatorEnabled'
  | 'opsSchedulerEnabled'
  | 'storageModuleEnabled'
  | 'commsHubEnabled'
  | 'biDashboardEnabled'
  | 'workflowEngineV2Enabled'
  | 'integrationLayerEnabled'
  | 'moveInsightsEnabled'
  | 'maintenanceAuditEnabled';

export const phaseOrder: PhaseKey[] = [
  'customerPortalEnabled',
  'smartQuoteEsignEnabled',
  'aiEstimatorEnabled',
  'opsSchedulerEnabled',
  'storageModuleEnabled',
  'commsHubEnabled',
  'biDashboardEnabled',
  'workflowEngineV2Enabled',
  'integrationLayerEnabled',
  'moveInsightsEnabled',
  'maintenanceAuditEnabled'
];

export function getNextPhase(currentKey: PhaseKey): PhaseKey | null {
  const index = phaseOrder.indexOf(currentKey);
  return index >= 0 && index < phaseOrder.length - 1
    ? phaseOrder[index + 1]
    : null;
}

export function markPhaseComplete(currentKey: PhaseKey) {
  features[currentKey] = true;
  const next = getNextPhase(currentKey);
  console.log(`✅ ${currentKey} marked complete.`);
  if (next) {
    console.log(`➡️  Next phase to unlock: ${next}`);
  } else {
    console.log('🏁 All phases complete!');
  }
  return next;
}
