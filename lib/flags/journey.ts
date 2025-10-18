export const useJourneyV2 =
  (typeof import.meta !== 'undefined' &&
   import.meta.env &&
   import.meta.env.VITE_USE_JOURNEY_V2 === 'true') || false;
