/**
 * Central feature flags. Keep defaults conservative/safe.
 * Flip to true only when the feature is confirmed stable.
 */
export const FLAGS = {
  LIVE_CHAT: false,
  AI_SUMMARIES: false,
  ESTIMATOR_AI: false,
} as const;

export type Flags = typeof FLAGS;
