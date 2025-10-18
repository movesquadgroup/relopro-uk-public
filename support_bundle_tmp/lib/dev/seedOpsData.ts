// lib/dev/seedOpsData.ts
type AnyRec = Record<string, any>;
const asArray = (v: any) => (Array.isArray(v) ? v : []);

function getLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return (JSON.parse(raw) ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function setLS(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function seedOpsDataIfEmpty() {
  const vehicles   = asArray(getLS<AnyRec[]>('opsVehicles', []));
  const teams      = asArray(getLS<AnyRec[]>('opsTeams', []));
  const resources  = asArray(getLS<AnyRec[]>('opsResources', []));
  const jobs       = asArray(getLS<AnyRec[]>('opsJobs', []));
  const events     = asArray(getLS<AnyRec[]>('opsEvents', []));
  const clients    = asArray(getLS<AnyRec[]>('clients', []));
  const quotes     = asArray(getLS<AnyRec[]>('quotes', []));

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0, 0);

  let changed = false;

  if (vehicles.length === 0) {
    setLS('opsVehicles', [
      { id: 'veh-1', name: 'Truck A', type: 'Luton', capacity: 800, status: 'Available' },
      { id: 'veh-2', name: 'Truck B', type: 'HGV',   capacity: 1800, status: 'Available' },
    ]);
    changed = true;
  }

  if (teams.length === 0) {
    setLS('opsTeams', [
      { id: 'team-1', name: 'Crew 1', members: ['Adrian','Dave'], skillTags: ['Residential'] },
      { id: 'team-2', name: 'Crew 2', members: ['Jane','Mike'],   skillTags: ['Commercial'] },
    ]);
    changed = true;
  }

  if (resources.length === 0) {
    setLS('opsResources', [
      { id: 'res-1', name: 'Packing Materials', type: 'Consumable' },
      { id: 'res-2', name: 'Portable Ramps',   type: 'Equipment' },
    ]);
    changed = true;
  }

  // Pick an existing client/quote if present; otherwise use mock IDs.
  const clientId = clients[0]?.id ?? 'CLI001';
  const quoteId  = quotes[0]?.id  ?? 'Q-1001';

  if (jobs.length === 0) {
    setLS('opsJobs', [
      { id: 'job-1', clientId, quoteId, status: 'Scheduled', scheduledDate: today.toISOString() },
      { id: 'job-2', clientId, quoteId, status: 'Scheduled', scheduledDate: tomorrow.toISOString() },
    ]);
    changed = true;
  }

  if (events.length === 0) {
    // Correcting to use diaryEvents as the key for ops events based on previous patches.
    const diaryEventsKey = 'diaryEvents';
    const currentDiaryEvents = asArray(getLS<AnyRec[]>(diaryEventsKey, []));
    if(currentDiaryEvents.filter(e => e.id.startsWith('evt-')).length === 0) {
        setLS(diaryEventsKey, [
          ...currentDiaryEvents,
          {
            id: 'evt-1',
            jobId: 'job-1',
            vehicleId: 'veh-1',
            teamId: 'team-1',
            type: 'Move',
            title: 'Load & Local Move',
            start: today.toISOString(),
            end: todayEnd.toISOString(),
            activityType: 'Booked Job',
            assignedVehicleIds: ['veh-1'],
            assignedStaffIds: ['team-1'],
            clientId: clientId,
            originAddress: 'Origin 1',
            destinationAddress: 'Destination 1'
          },
          {
            id: 'evt-2',
            jobId: 'job-2',
            vehicleId: 'veh-2',
            teamId: 'team-2',
            type: 'Move',
            title: 'Linehaul to Destination',
            start: tomorrow.toISOString(),
            end: tomorrowEnd.toISOString(),
            activityType: 'Booked Job',
            assignedVehicleIds: ['veh-2'],
            assignedStaffIds: ['team-2'],
            clientId: clientId,
            originAddress: 'Origin 2',
            destinationAddress: 'Destination 2'
          },
        ]);
        changed = true;
    }
  }

  if (changed) {
    console.log('[Ops Seeder] Seeded default ops data (vehicles/teams/resources/jobs/events).');
  } else {
    console.log('[Ops Seeder] Skipped — ops data already present.');
  }
}