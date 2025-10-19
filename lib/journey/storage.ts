import type { JourneyState } from "./types";

const KEY = "journey_state_v1";

export function loadJourney(): JourneyState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveJourney(state: JourneyState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
