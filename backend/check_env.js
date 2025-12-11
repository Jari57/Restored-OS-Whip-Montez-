const path = require('path');

// Load .env from backend directory (same behavior as server.js)
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const key = process.env.GEMINI_API_KEY;

if (key) {
  console.log('OK: GEMINI_API_KEY is set. Length:', key.length, '(value hidden).');
} else {
  console.warn('WARNING: GEMINI_API_KEY not found in backend/.env or environment.');
  console.warn('Create backend/.env with: GEMINI_API_KEY=your_key (do NOT commit secrets).');
}

// Intentionally exit 0 so CI doesn't fail when secrets are absent.
process.exit(0);
