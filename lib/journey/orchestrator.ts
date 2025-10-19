import type { JourneyEvent, JourneyListener, JourneyStage, JourneyState } from "./types";
import { loadJourney, saveJourney } from "./storage";

const ORDER: JourneyStage[] = [
  "LEAD",
  "SURVEY",
  "COSTING",
  "QUOTE",
  "DECISION",
  "JOB",
  "SCHEDULE",
  "OPERATIONS",
  "COMPLETE",
  "AFTER_MOVE",
];

function defaultState(): JourneyState {
  return {
    stage: "LEAD",
    pointers: {},
    updatedAt: Date.now(),
  };
}

class Orchestrator {
  private state: JourneyState = loadJourney() ?? defaultState();
  private listeners = new Set<JourneyListener>();

  subscribe(fn: JourneyListener) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  getState() {
    return this.state;
  }

  private emit() {
    this.state.updatedAt = Date.now();
    saveJourney(this.state);
    for (const fn of this.listeners) fn(this.state);
  }

  dispatch(ev: JourneyEvent) {
    switch (ev.type) {
      case "RESET":
        this.state = defaultState();
        break;
      case "SET_STAGE":
        if (ORDER.includes(ev.stage)) this.state.stage = ev.stage;
        break;
      case "ADVANCE": {
        const idx = ORDER.indexOf(this.state.stage);
        if (idx >= 0 && idx < ORDER.length - 1) {
          this.state.stage = ORDER[idx + 1];
        }
        break;
      }
      case "BACK": {
        const idx = ORDER.indexOf(this.state.stage);
        if (idx > 0) {
          this.state.stage = ORDER[idx - 1];
        }
        break;
      }
      case "SET_POINTERS":
        this.state.pointers = { ...this.state.pointers, ...ev.patch };
        break;
    }
    this.emit();
  }
}

export const journey = new Orchestrator();
export const JourneyOrder = ORDER;
