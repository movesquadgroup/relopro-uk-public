export type JourneyStage =
  | "LEAD"
  | "SURVEY"
  | "COSTING"
  | "QUOTE"
  | "DECISION"
  | "JOB"
  | "SCHEDULE"
  | "OPERATIONS"
  | "COMPLETE"
  | "AFTER_MOVE";

export interface JourneyPointers {
  clientId?: string;
  surveyId?: string;
  costingId?: string;
  quoteId?: string;
  jobId?: string;
  scheduleId?: string;
  opsId?: string;
}

export interface JourneyState {
  stage: JourneyStage;
  pointers: JourneyPointers;
  updatedAt: number; // epoch ms
}

export type JourneyEvent =
  | { type: "RESET" }
  | { type: "ADVANCE" }
  | { type: "BACK" }
  | { type: "SET_STAGE"; stage: JourneyStage }
  | { type: "SET_POINTERS"; patch: Partial<JourneyPointers> };

export type JourneyListener = (s: JourneyState) => void;
