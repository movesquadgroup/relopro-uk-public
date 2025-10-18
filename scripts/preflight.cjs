require('dotenv').config({ path: '.env.local' });
const want = ['VITE_FIREBASE_API_KEY','VITE_FIREBASE_AUTH_DOMAIN','VITE_FIREBASE_PROJECT_ID','VITE_FIREBASE_STORAGE_BUCKET'];
const missing = want.filter(k => !process.env[k]);
if (missing.length) {
  console.log('[preflight] Missing env:', missing.join(', '));
} else {
  console.log('[preflight] ✅ env looks good');
}
process.exit(0); // warn-only
