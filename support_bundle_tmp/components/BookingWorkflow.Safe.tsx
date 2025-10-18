import React from 'react';

type AnyRec = Record<string, any>;

export interface SafeBookingWorkflowProps {
  clients: AnyRec[];
  quotes: AnyRec[];
  diaryEvents: AnyRec[];
  events: AnyRec[];
  jobs: AnyRec[];
  vehicles: AnyRec[];
  teams: AnyRec[];
  resources: AnyRec[];
}

const asArray = (v: any) => (Array.isArray(v) ? v : []);
const byId = (arr: AnyRec[]) => Object.fromEntries(asArray(arr).map((r) => [r.id, r]));

function formatDay(iso?: string) {
  if (!iso) return 'Unscheduled';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
  } catch {
    return 'Unscheduled';
  }
}

function sameYMD(a: string, b: string) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

export default function BookingWorkflowSafe(props: SafeBookingWorkflowProps) {
  const clients   = asArray(props.clients);
  const quotes    = asArray(props.quotes);
  const events    = asArray(props.events);
  const jobs      = asArray(props.jobs);
  const vehicles  = asArray(props.vehicles);
  const teams     = asArray(props.teams);

  // Quick indices for lookups
  const clientIx  = byId(clients);
  const quoteIx   = byId(quotes);
  const jobIx     = byId(jobs);
  const vehicleIx = byId(vehicles);
  const teamIx    = byId(teams);

  // Group events into "today" and "tomorrow" (simple weekly cue, no DnD)
  const now = new Date();
  const todayISO = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

  const todayEvents = events.filter(e => e?.start && sameYMD(e.start, todayISO));
  const tomorrowEvents = events.filter(e => e?.start && sameYMD(e.start, tomorrow));
  const unscheduledEvents = events.filter(e => !e?.start);

  const cardsFor = (list: AnyRec[]) => (
    <div className="space-y-3">
      {list.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No events.</p>}
      {list.map((evt: AnyRec) => {
        const job   = evt.jobId && jobIx[evt.jobId];
        const quote = job?.quoteId && quoteIx[job.quoteId];
        const client = (job?.clientId && clientIx[job.clientId]) || (quote?.clientId && clientIx[quote.clientId]);
        const vehicle = evt.vehicleId && vehicleIx[evt.vehicleId];
        const team = evt.teamId && teamIx[evt.teamId];

        return (
          <div key={evt.id} className="p-3 rounded-md bg-white shadow border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">{evt.title || 'Move Event'}</h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
                {evt.type || 'Move'}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              <div>{client?.name || 'Client: N/A'}</div>
              <div>{vehicle ? `Vehicle: ${vehicle.name}` : 'Vehicle: N/A'}</div>
              <div>{team ? `Team: ${team.name}` : 'Team: N/A'}</div>
              <div>
                {evt.start
                  ? `${new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${
                      evt.end ? new Date(evt.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                    }`
                  : 'Unscheduled'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  console.log('[Ops Scheduler] Using SAFE fallback (non-draggable).', {
    clients: clients.length,
    quotes: quotes.length,
    events: events.length,
    jobs: jobs.length,
    vehicles: vehicles.length,
    teams: teams.length,
  });

  return (
    <div>
      <div className="mb-4 p-2 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
        Ops Scheduler is running in <strong>Safe Mode</strong> (drag-and-drop disabled) to avoid preview crashes.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 border-b pb-2 mb-3 dark:border-gray-700">
            {`Today – ${formatDay(todayISO)}`}
          </h3>
          {cardsFor(todayEvents)}
        </section>

        <section className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 border-b pb-2 mb-3 dark:border-gray-700">
            {`Tomorrow – ${formatDay(tomorrow)}`}
          </h3>
          {cardsFor(tomorrowEvents)}
        </section>

        <section className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700">
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 border-b pb-2 mb-3 dark:border-gray-700">
            Unscheduled
          </h3>
          {cardsFor(unscheduledEvents)}
        </section>
      </div>
    </div>
  );
}
