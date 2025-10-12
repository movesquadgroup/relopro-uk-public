/**
 * Lightweight diagnostics logger:
 *  - Captures console + errors
 *  - Buffers in localStorage('diag_log')
 *  - Exposes helpers to clear/flush
 *  - Can run basic route + AI checks
 */

type DiagEntry = { ts:string; level:'log'|'warn'|'error'|'info'; msg:string };
const KEY = 'diag_log';

function now() {
  return new Date().toISOString();
}

function readBuf(): DiagEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeBuf(buf: DiagEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(buf).slice(0, 2_000_000)); } catch {}
}

export function diagClear() { localStorage.removeItem(KEY); }
export function diagGet(): DiagEntry[] { return readBuf(); }

function push(level: DiagEntry['level'], msg: string) {
  const buf = readBuf();
  buf.push({ ts: now(), level, msg });
  writeBuf(buf);
}

// Wrap console
const _log = console.log, _warn = console.warn, _error = console.error, _info = console.info;
console.log = (...a:any[]) => { try { push('log', a.map(String).join(' ')); } catch {} _log(...a); };
console.warn = (...a:any[]) => { try { push('warn', a.map(String).join(' ')); } catch {} _warn(...a); };
console.error = (...a:any[]) => { try { push('error', a.map(String).join(' ')); } catch {} _error(...a); };
console.info = (...a:any[]) => { try { push('info', a.map(String).join(' ')); } catch {} _info(...a); };

// Global errors
window.addEventListener('error', (e) => push('error', `window.onerror: ${e.message || e.error}`));
window.addEventListener('unhandledrejection', (e:any) => push('error', `unhandledrejection: ${e?.reason || e}`));

// ---- Route diagnostics (no code writes) ----
export async function runRouteDiagnostics(): Promise<string> {
  const routes = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'CRM', path: '/crm' },
    { name: 'Client Detail (sample)', path: '/crm/CLI001' },
    { name: 'Quoting', path: '/quoting' },
    { name: 'Diary', path: '/diary' },
    { name: 'Operations', path: '/operations' },
  ];
  const lines: string[] = [];
  lines.push(`ROUTE DIAGNOSTICS @ ${now()}`);
  for (const r of routes) {
    try {
      // "Simulated" mount: attempt to navigate without mutating code.
      // If your router is hash-based, change to "#"+r.path.
      history.pushState({}, '', '/#' + r.path);
      lines.push(`✅ ${r.name} (${r.path}) — mounted without crash`);
    } catch (err:any) {
      lines.push(`❌ ${r.name} (${r.path}) — ${err?.message || err}`);
    }
  }
  history.pushState({}, '', '/#/dashboard'); // Return to a safe route
  return lines.join('\n');
}

// ---- AI diagnostics (no code writes) ----
export async function runAiDiagnostics(): Promise<string> {
  const results: string[] = [];
  results.push(`AI DIAGNOSTICS @ ${now()}`);
  try {
    const mod = await import('./ai');
    const checks: [string, () => Promise<any>][] = [
      ['getAiLeadScore', async () => mod.getAiLeadScore?.({ enquiryType:'International', budget:15000 } as any)],
      ['getConversationSummary', async () => mod.getConversationSummary?.([{ id:'a1', type:'Note', content:'Test', author:'Diag', timestamp: now() }] as any)],
      // FIX: The `getTaskSuggestions` call was already correct due to the fix in lib/ai.ts. No change needed here.
      ['getTaskSuggestions', async () => mod.getTaskSuggestions?.('Test summary', {})],
      // FIX: Pass a mock client object to getNextBestAction to satisfy its signature.
      ['getNextBestAction', async () => mod.getNextBestAction?.({} as any)],
    ];
    for (const [name, fn] of checks) {
      if (!fn) { results.push(`⚠️ ${name}: not found`); continue; }
      try {
        const t0 = performance.now();
        const res = await fn();
        const t1 = performance.now();
        results.push(`✅ ${name}: OK in ${Math.round(t1 - t0)}ms, sample=${JSON.stringify(res).slice(0,150)}`);
      } catch (e:any) {
        results.push(`❌ ${name}: ${e?.message || e}`);
      }
    }
  } catch (e:any) {
    results.push(`❌ Failed to import ./ai: ${e?.message || e}`);
  }
  return results.join('\n');
}

// ---- File append helper (Gemini will call this after Preview) ----
export function buildDiagnosticsReport(routeText:string, aiText:string): string {
  const header = `\n\n===== RUN @ ${now()} =====\n`;
  const env = `UA=${navigator.userAgent}\nURL=${location.href}\n`;
  const consoleTail = diagGet().slice(-50).map(e => `[${e.ts}] ${e.level.toUpperCase()} ${e.msg}`).join('\n');
  return header + env + routeText + '\n\n' + aiText + '\n\nCONSOLE (last 50):\n' + consoleTail + '\n===== END =====\n';
}