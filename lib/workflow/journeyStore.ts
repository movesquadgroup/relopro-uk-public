import { useSyncExternalStore } from 'react';

export type JourneyStage =
  | 'LEAD'
  | 'SURVEY'
  | 'COSTING'
  | 'QUOTE'
  | 'SCHEDULE'
  | 'OPERATIONS'
  | 'AFTER_MOVE';

export type JourneyPointers = {
  clientId?: string;
  quoteId?: string;
  jobId?: string;
};

export type JourneyState = {
  stage: JourneyStage;
  pointers: JourneyPointers;
  updatedAt: number;
};

const STORAGE_KEY = 'journey:v1';

function readStorage(): JourneyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as JourneyState;
  } catch {
    return null;
  }
}

function writeStorage(state: JourneyState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore write errors (private mode, quota, etc.)
  }
}

let state: JourneyState =
  readStorage() || { stage: 'LEAD', pointers: {}, updatedAt: Date.now() };

type Listener = () => void;
const listeners = new Set<Listener>();

function setState(partial: Partial<JourneyState>) {
  state = { ...state, ...partial, updatedAt: Date.now() };
  writeStorage(state);
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

/** Public hooks */
export function useJourney(): JourneyState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useJourneyActions() {
  return {
    setStage: (stage: JourneyStage) => setState({ stage }),
    setPointers: (pointers: JourneyPointers) =>
      setState({ pointers: { ...state.pointers, ...pointers } }),
    resetJourney: () => setState({ stage: 'LEAD', pointers: {} }),
  };
}
