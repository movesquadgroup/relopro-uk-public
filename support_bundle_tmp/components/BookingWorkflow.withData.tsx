import * as React from 'react';
// Swap to SAFE (non-draggable) scheduler to avoid DnD hook crashes in preview.
import BookingWorkflow from './BookingWorkflow.Safe';
import { DiaryEvent } from '../types';

// Small helper: always return an array
const asArray = (v: any) => (Array.isArray(v) ? v : []);

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

/**
 * BookingWorkflowWithData
 * Reads all expected data sources from localStorage, falls back to [].
 * Passes them to BookingWorkflow so it never receives undefined.
 */
const BookingWorkflowWithData: React.FC<{ onUpdateJob: (job: DiaryEvent) => void }> = ({ onUpdateJob }) => {
  // Keys already used elsewhere in your app:
  const clients      = asArray(getLS('clients', []));
  const quotes       = asArray(getLS('quotes', []));
  const diaryEvents  = asArray(getLS('diaryEvents', []));

  // Extra ops data (fall back to [] if not present yet)
  const events       = asArray(getLS('diaryEvents', [])); // Use diaryEvents for events as per previous context
  const jobs         = asArray(getLS('opsJobs', []));
  const vehicles     = asArray(getLS('opsVehicles', []));
  const teams        = asArray(getLS('opsTeams', []));
  const resources    = asArray(getLS('opsResources', []));

  React.useEffect(() => {
    console.log('[OpsScheduler Data Diagnostics]', {
      clients: clients.length,
      quotes: quotes.length,
      diaryEvents: diaryEvents.length,
      events: events.length,
      jobs: jobs.length,
      vehicles: vehicles.length,
      teams: teams.length,
      resources: resources.length,
    });
  }, [clients, quotes, diaryEvents, events, jobs, vehicles, teams, resources]);

  return (
    <BookingWorkflow
      clients={clients}
      quotes={quotes}
      diaryEvents={diaryEvents}
      events={events}
      jobs={jobs}
      vehicles={vehicles}
      teams={teams}
      resources={resources}
    />
  );
};

export default BookingWorkflowWithData;
