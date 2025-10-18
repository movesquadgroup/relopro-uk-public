// Central Safe Mode read/write with defaults
export function getSafeMode(): boolean {
  try { return localStorage.getItem('SAFE_MODE') === '1'; } catch { return false; }
}
export function setSafeMode(on: boolean) {
  try { localStorage.setItem('SAFE_MODE', on ? '1' : '0'); } catch {}
}
