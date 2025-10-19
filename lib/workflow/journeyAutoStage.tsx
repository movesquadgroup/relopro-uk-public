import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useJourney, useJourneyActions, JourneyStage, JourneyStage } from './journeyStore';

/**
 * JourneyAutoStage
 * - Watches the current route (HashRouter) and infers the correct journey stage
 * - Optionally reads ?clientId=&quoteId=&jobId= from the URL
 * - Updates the journey store only when something actually changes
 */
export default function JourneyAutoStage() {
  const location = useLocation();
  const { stage, pointers } = useJourney();
  const { setStage, setPointers } = useJourneyActions();
  const lastKey = useRef<string>("");

  useEffect(() => {
    const path = (location.pathname || '').toLowerCase();
    const search = location.search || '';
    const params = new URLSearchParams(search);
    const clientId = params.get('clientId') || undefined;
    const quoteId  = params.get('quoteId')  || undefined;
    const jobId    = params.get('jobId')    || undefined;

    // Map common paths to stages (adjust as needed)
    const routeToStage: Array<{ match: (p: string) => boolean; stage: JourneyStage }> = [
      { match: p => p === '/' || p.includes('/crm') || p.includes('/sales'),                        stage: 'LEAD' },
      { match: p => p.includes('/survey'),                                                         stage: 'SURVEY' },
      { match: p => p.includes('/cost') || p.includes('/costing') || p.includes('/costings'),      stage: 'COSTING' },
      { match: p => p.includes('/quote'),                                                          stage: 'QUOTE' },
      { match: p => p.includes('/diary') || p.includes('/schedule'),                               stage: 'SCHEDULE' },
      { match: p => p.includes('/ops') || p.includes('/operations') || p.includes('/scheduler'),   stage: 'OPERATIONS' },
      { match: p => p.includes('/postmove') || p.includes('/after'),                               stage: 'AFTER_MOVE' },
    ];

    let nextStage: JourneyStage = stage || 'LEAD';
    for (const item of routeToStage) {
      if (item.match(path)) {
        nextStage = item.stage;
        break;
      }
    }

    const nextPointers = {
      ...(pointers || {}),
      ...(clientId ? { clientId } : {}),
      ...(quoteId  ? { quoteId  } : {}),
      ...(jobId    ? { jobId    } : {}),
    };

    // Build a small dedupe key so we don’t spam state updates
    const key = JSON.stringify({ s: nextStage, p: nextPointers });
    if (key !== lastKey.current) {
      if (nextStage !== stage) setStage(nextStage);
      const changedPointers =
        !pointers ||
        pointers.clientId !== nextPointers.clientId ||
        pointers.quoteId  !== nextPointers.quoteId  ||
        pointers.jobId    !== nextPointers.jobId;
      if (changedPointers) setPointers(nextPointers);
      lastKey.current = key;
    }
  }, [location.pathname, location.search, stage, pointers, setStage, setPointers]);

  return null;
}
