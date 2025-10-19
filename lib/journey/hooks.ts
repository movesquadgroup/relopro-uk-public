import { useEffect, useState } from "react";
import { journey } from "./orchestrator";
import type { JourneyState } from "./types";

export function useJourney(): JourneyState {
  const [s, set] = useState(journey.getState());
  useEffect(() => journey.subscribe(set), []);
  return s;
}

export function useJourneyActions() {
  return {
    reset: () => journey.dispatch({ type: "RESET" }),
    advance: () => journey.dispatch({ type: "ADVANCE" }),
    back: () => journey.dispatch({ type: "BACK" }),
    setStage: (stage: JourneyState["stage"]) =>
      journey.dispatch({ type: "SET_STAGE", stage }),
    setPointers: (patch: Partial<JourneyState["pointers"]>) =>
      journey.dispatch({ type: "SET_POINTERS", patch }),
  };
}
