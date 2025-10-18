/**
 * Safe preflight: only prints hints, never exits non-zero.
 * Run manually: `node scripts/preflight.cjs`
 */
let dotenvLoaded = false;
try {
  require('dotenv').config({ path: '.env.local' });
  dotenvLoaded = true;
} catch {}
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  // add others you care about:
  // 'VITE_GEMINI_API_KEY'
];

const missing = required.filter(k => !process.env[k] || !String(process.env[k]).trim());

if (!dotenvLoaded) {
  console.log('[preflight] dotenv not found (ok) – skipping .env.local load');
}
if (missing.length) {
  console.log('[preflight] Missing env vars:', missing.join(', '));
  console.log('Add them to .env.local to silence this message.');
} else {
  console.log('[preflight] ✅ env looks good');
}

// NEVER fail – stability-first
process.exit(0);
