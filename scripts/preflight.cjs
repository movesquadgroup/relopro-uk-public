/**
 * Preflight: load .env.local for dev and verify required keys.
 * Safe even if dotenv is missing (will just skip loading).
 */
try {
  // Load .env.local first (preferred for dev), then .env
  const dotenv = require('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config(); // fallback .env
  console.log('[preflight] env loaded via dotenv');
} catch (e) {
  // Not fatal; Vite will still provide import.meta.env at runtime.
  console.log('[preflight] dotenv not found, continuing without it');
}

const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
];

const missing = required.filter((k) => !process.env[k] || !String(process.env[k]).trim());

if (missing.length) {
  console.log('\n[preflight] Missing env vars:', missing.join(', '));
  console.log('Create .env.local with these keys. Example:');
  console.log('VITE_FIREBASE_API_KEY=...');
  console.log('VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0157482863.firebaseapp.com');
  console.log('VITE_FIREBASE_PROJECT_ID=gen-lang-client-0157482863');
  console.log('VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0157482863.appspot.com\n');
} else {
  console.log('[preflight] ✅ env looks good');
}

// Don’t block dev even if keys are missing (set to 1 to enforce)
process.exit(0);
