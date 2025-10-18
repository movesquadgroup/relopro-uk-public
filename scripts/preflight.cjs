/**
 * Safe preflight: tries to load .env.local but NEVER crashes the dev server.
 * If dotenv isn't installed or file missing, it just logs and continues.
 */
try {
  const dotenv = require('dotenv');
  // Load .env.local first if present, then fallback to .env
  const loadedLocal = dotenv.config({ path: '.env.local' });
  const loadedDefault = dotenv.config(); // .env
  console.log('[preflight] env loaded via dotenv');
} catch (e) {
  console.log('[preflight] dotenv not available or failed to load; continuing');
}

// Simple, non-blocking sanity checks
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
];
const missing = required.filter((k) => !process.env[k] || !String(process.env[k]).trim());

if (missing.length) {
  console.log('\n[preflight] Missing env vars:', missing.join(', '));
  console.log('Dev will continue, but features depending on these may be limited.');
  console.log('Add them to .env.local to silence this message.\n');
} else {
  console.log('[preflight] ✅ env looks good');
}

// Never block dev
process.exit(0);
