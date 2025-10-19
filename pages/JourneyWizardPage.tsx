import React, { useMemo, useState } from 'react';
import { getJourney, setJourney, resetJourney, nextStage, JourneyStage } from '../lib/journeyStore';

type Field = keyof ReturnType<typeof getJourney>['pointers'];

const label: Record<JourneyStage,string> = {
  LEAD:'Lead / CRM',
  SURVEY:'Survey',
  COSTING:'Costing',
  QUOTE:'Quote',
  ACCEPTED:'Accepted',
  DECLINED:'Declined',
  JOB:'Create Job',
  SCHEDULE:'Schedule',
  OPERATIONS:'Operations',
  COMPLETE:'Complete Job',
  AFTERMOVE:'After Move',
};

export default function JourneyWizardPage() {
  const [state, setState] = useState(getJourney());
  const [clientId, setClientId] = useState(state.pointers.clientId ?? '');
  const [quoteId, setQuoteId]   = useState(state.pointers.quoteId ?? '');
  const [jobId, setJobId]       = useState(state.pointers.jobId ?? '');

  const stages: JourneyStage[] = ['LEAD','SURVEY','COSTING','QUOTE','ACCEPTED','DECLINED','JOB','SCHEDULE','OPERATIONS','COMPLETE','AFTERMOVE'];
  const idx = stages.indexOf(state.stage);
  const isTerminal = state.stage === 'DECLINED' || state.stage === 'AFTERMOVE';

  const canAdvance = !isTerminal && idx >= 0 && idx < stages.length - 1;
  const canBack    = idx > 0;

  function writePointers() {
    const next = setJourney({ pointers: { clientId: clientId || undefined, quoteId: quoteId || undefined, jobId: jobId || undefined }});
    setState(next);
  }

  function go(stage: JourneyStage) {
    const next = setJourney({ stage });
    setState(next);
  }

  function advance() {
    const nextS = nextStage(state.stage);
    go(nextS);
  }

  function back() {
    const order = stages;
    if (idx > 0) go(order[idx-1]);
  }

  function decline() { go('DECLINED'); }

  function resetAll() {
    resetJourney();
    const fresh = getJourney();
    setClientId('');
    setQuoteId('');
    setJobId('');
    setState(fresh);
  }

  const pill = useMemo(() => {
    const color =
      state.stage === 'DECLINED' ? 'bg-rose-600' :
      state.stage === 'ACCEPTED' ? 'bg-emerald-600' :
      'bg-sky-600';
    return `inline-block px-2.5 py-1 rounded-full text-white text-xs ${color}`;
  }, [state.stage]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Journey Wizard</h1>
        <p className="text-slate-600">Drive the end-to-end journey safely (local only). Does not impact real data.</p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <span className={pill}>{label[state.stage] ?? state.stage}</span>
          <span className="text-slate-500 text-sm">updated {new Date(state.updatedAt).toLocaleString()}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['LEAD','SURVEY','COSTING','QUOTE','ACCEPTED','DECLINED','JOB','SCHEDULE','OPERATIONS','COMPLETE','AFTERMOVE'] as JourneyStage[])
            .map(s => (
              <button
                key={s}
                onClick={() => go(s)}
                className={`px-3 py-1.5 rounded border text-sm ${s===state.stage?'bg-slate-900 text-white border-slate-900':'border-slate-300 hover:bg-slate-100'}`}
              >
                {label[s]}
              </button>
            ))
          }
        </div>

        <div className="flex gap-2">
          <button onClick={back} disabled={!canBack} className="px-3 py-1.5 rounded border border-slate-300 disabled:opacity-50">Back</button>
          <button onClick={advance} disabled={!canAdvance} className="px-3 py-1.5 rounded bg-slate-900 text-white disabled:opacity-50">Next</button>
          <button onClick={decline} className="px-3 py-1.5 rounded bg-rose-600 text-white">Mark Declined</button>
          <button onClick={resetAll} className="px-3 py-1.5 rounded border border-slate-300">Reset</button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Link IDs (optional)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">clientId</label>
            <input value={clientId} onChange={e=>setClientId(e.target.value)} onBlur={writePointers}
              className="w-full border rounded px-2.5 py-1.5" placeholder="abc123" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">quoteId</label>
            <input value={quoteId} onChange={e=>setQuoteId(e.target.value)} onBlur={writePointers}
              className="w-full border rounded px-2.5 py-1.5" placeholder="q-001" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">jobId</label>
            <input value={jobId} onChange={e=>setJobId(e.target.value)} onBlur={writePointers}
              className="w-full border rounded px-2.5 py-1.5" placeholder="job-001" />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Raw state</h2>
        <pre className="text-xs bg-slate-50 border rounded p-3 overflow-auto">{JSON.stringify(state, null, 2)}</pre>
      </section>
    </div>
  );
}
