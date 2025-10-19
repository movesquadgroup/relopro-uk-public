export type JourneyStage =
  | 'LEAD' | 'SURVEY' | 'COSTING' | 'QUOTE'
  | 'ACCEPTED' | 'DECLINED'
  | 'JOB' | 'SCHEDULE' | 'OPERATIONS'
  | 'COMPLETE' | 'AFTERMOVE';

export type JourneyState = {
  stage: JourneyStage;
  pointers: { clientId?: string; quoteId?: string; jobId?: string };
  updatedAt: number;
};

const KEY = 'rp_journey';

export function getJourney(): JourneyState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { stage: 'LEAD', pointers: {}, updatedAt: Date.now() };
    const j = JSON.parse(raw);
    return { stage: j.stage ?? 'LEAD', pointers: j.pointers ?? {}, updatedAt: j.updatedAt ?? Date.now() };
  } catch {
    return { stage: 'LEAD', pointers: {}, updatedAt: Date.now() };
  }
}

export function setJourney(next: Partial<JourneyState>) {
  const cur = getJourney();
  const merged: JourneyState = {
    stage: (next.stage ?? cur.stage),
    pointers: { ...cur.pointers, ...(next.pointers ?? {}) },
    updatedAt: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}

export function resetJourney() {
  localStorage.removeItem(KEY);
}

export function nextStage(s: JourneyStage): JourneyStage {
  const order: JourneyStage[] = [
    'LEAD','SURVEY','COSTING','QUOTE','ACCEPTED','JOB','SCHEDULE','OPERATIONS','COMPLETE','AFTERMOVE'
  ];
  // If DECLINED, keep it (terminal)
  if (s === 'DECLINED') return 'DECLINED';
  const i = order.indexOf(s);
  return i >= 0 && i < order.length - 1 ? order[i+1] : s;
}
