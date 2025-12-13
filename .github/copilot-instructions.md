# Copilot Instructions for AI Coding Agents

This repository is a two-part app: a Node/Express backend that proxies Google Gemini (Gemini SDK) and a React/Vite frontend using Firebase. Use these notes to make productive, low-risk code changes.

## Table of Contents
1. [Quick Architecture](#quick-architecture-big-picture)
2. [Developer Workflows](#how-to-run--developer-workflows)
3. [Linting & Code Quality](#linting--code-quality)
4. [Testing](#testing)
5. [API Contract](#api-contract-be-explicit)
6. [Project Conventions](#project-specific-conventions--patterns)
7. [Dependencies](#dependency-management)
8. [CI/CD](#ci-example)
9. [Security](#security-considerations)
10. [Key Files](#key-files-to-inspect-for-changes)
11. [Common Pitfalls](#common-pitfalls--troubleshooting)
12. [External Integrations](#external-integrations--risks)
13. [What Not to Do](#what-the-ai-agent-should-not-do)
14. [Examples](#small-actionable-examples-for-changes)

## Quick architecture (big picture)
- **Backend:** `backend/server.js` — Express API that reads `backend/.env` for `GEMINI_API_KEY`, initializes `GoogleGenerativeAI`, and exposes `POST /api/generate` which returns JSON `{ output: string }`.
- **Frontend:** `frontend/src/App.jsx` — single-file React app (many UI sections) that uses Firebase for auth/firestore and calls the backend via `callGemini()` to generate text. `BACKEND_URL` is toggled by `isLocal` (localhost:3001) or production placeholder.
- **Integration flow:** Frontend -> POST `/api/generate` -> Backend uses `@google/generative-ai` -> responds `{ output }`. Firebase is used locally for state/auth (keys are bundled in `App.jsx`).

## How to run / developer workflows

### Prerequisites
- Node.js 22.12.0 (see `.nvmrc`, minimum: 20.19.0)
- Git
- `GEMINI_API_KEY` in `backend/.env`

### Local Setup & Development

**From repository root**, use these npm scripts:

```powershell
# Install all dependencies (backend + frontend)
npm run install:all

# Kill all Node processes (fixes port conflicts)
npm run kill

# Terminal 1: Start backend (localhost:3001)
npm run backend
# OR fresh start (kills old processes first)
npm run fresh

# Terminal 2: Start frontend (localhost:5173)
npm run dev
```

**Manual startup** (if scripts don't work):

```powershell
# Backend
cd backend
npm install
npm start  # or: node server.js

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Important Workflow Notes
- **Always start backend FIRST**, wait 5 seconds, then start frontend
- Use **two separate terminals** for backend + frontend
- The backend must be running before frontend can make API calls
- If you encounter port conflicts, run `npm run kill` first

### Debug tips
- Backend logs API key loading and will print a substring of the key or an explicit missing-key error
- Frontend logs attempts to contact the backend (see `callGemini()` in `frontend/src/App.jsx`) and returns clear strings on failure: `ERROR: BACKEND OFFLINE...` or `CONNECTION ERROR: BACKEND UNREACHABLE.`
- Check `backend/logs/` directory for Winston error logs
- Backend dashboard available at: `http://localhost:3001/dashboard`

### Environment Variables
```env
# backend/.env (REQUIRED)
GEMINI_API_KEY=your_key_here
PORT=3001
NODE_ENV=development
```

## Linting & Code Quality

### Frontend (ESLint)
The frontend uses ESLint with React-specific rules:

```bash
cd frontend
npm run lint        # Check for linting errors
```

**Configuration:** `frontend/eslint.config.js`
- Uses `@eslint/js` recommended rules
- React Hooks plugin for hooks linting
- React Refresh plugin for fast refresh
- Custom rule: `no-unused-vars` with pattern `^[A-Z_]` (allows unused uppercase constants)
- Ignores `dist/` directory

**When making frontend changes:**
- Always run `npm run lint` before committing
- Fix linting errors immediately - don't commit code with lint warnings
- ESLint will catch unused variables, missing dependencies in hooks, and React best practices violations

### Backend
No automated linting currently configured for backend. Follow these conventions:
- CommonJS syntax (`require`, `module.exports`)
- 2-space indentation
- Single quotes for strings
- Semicolons required

## Testing

**Current State:** No automated test suite exists yet.

**Testing Approach for AI Agents:**
- Manually test changes by running the application locally
- For backend changes: Test API endpoints with curl or the dashboard
- For frontend changes: Test in browser at `http://localhost:5173`
- Check console logs for errors
- Verify existing functionality still works

**Example manual testing:**
```bash
# Test backend API
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","systemInstruction":"be brief"}'

# Test model discovery
curl http://localhost:3001/api/models
```

## API contract (be explicit)
- Request: `POST /api/generate` with JSON body `{ "prompt": string, "systemInstruction": string }`.
- Success response: `200 { "output": string }`.
- Error response: `500 { "error": "AI Generation Failed", "details": string }`.

Example curl (local):

```bash
curl -X POST http://localhost:3001/api/generate -H "Content-Type: application/json" \
  -d '{"prompt":"write a 4-line hook","systemInstruction":"be lyrical"}'
```

## Project-specific conventions & patterns

### Frontend Conventions
- **Single file app:** All UI code is in `frontend/src/App.jsx` (~5000+ lines)
- **Firebase config:** Bundled directly inside `App.jsx` — do not assume an external config file or env var for Firebase
- **Backend URL detection:** `isLocal` in `App.jsx` detects `window.location.hostname` and switches `BACKEND_URL`:
  - Local: `http://localhost:3001/api/generate`
  - Production: Points to Railway deployment
- **State management:** Uses React hooks (useState, useEffect) with Firebase Firestore for persistence
- **Styling:** Inline Tailwind CSS classes (no external stylesheets)
- **Icons:** Lucide React library
- **Build tool:** Vite (ES modules, fast HMR)

### Backend Conventions
- **Module system:** CommonJS (`"type":"commonjs"` in package.json)
- **Entry point:** `backend/server.js`
- **Environment loading:** Uses `path.resolve(__dirname, '.env')` — API key must be in `backend/.env`, NOT repo root `.env`
- **Port:** 3001 (configurable via PORT env var)
- **Logging:** Winston logger with file rotation in `backend/logs/`
- **Model:** Currently uses `gemini-2.0-flash-exp` (configurable via `GENERATIVE_MODEL` env var in server.js)
- **Scripts:** `npm start` → `node server.js`

### Code Style
- **Frontend:** ES6+ modules, JSX, functional components with hooks
- **Backend:** CommonJS, async/await for async operations
- **Error handling:** Try-catch blocks with detailed error messages
- **Logging:** Use Winston logger, not console.log in production code
- **Comments:** Minimal comments; code should be self-documenting

### File Organization
```
backend/
  ├── server.js              # Main Express server
  ├── check_env.js           # Environment check helper
  ├── dashboard.html         # Monitoring dashboard
  ├── logs/                  # Winston logs (gitignored)
  └── .env                   # Secrets (gitignored)

frontend/
  ├── src/
  │   ├── App.jsx           # Main application (5000+ lines)
  │   └── main.jsx          # Entry point
  ├── public/               # Static assets
  ├── eslint.config.js      # ESLint configuration
  └── vite.config.js        # Vite build config
```

## Dependency Management

### Backend Dependencies
```json
{
  "@google/generative-ai": "^0.24.1",  // Gemini SDK
  "cors": "^2.8.5",                     // CORS middleware
  "dotenv": "^17.2.3",                  // Environment variables
  "express": "^5.2.1",                  // Web framework
  "express-rate-limit": "^8.2.1",       // Rate limiting
  "helmet": "^8.1.0",                   // Security headers
  "morgan": "^1.10.1",                  // HTTP request logger
  "winston": "^3.19.0"                  // File logging
}
```

### Frontend Dependencies
```json
{
  "firebase": "^12.6.0",               // Firebase SDK
  "lucide-react": "^0.556.0",          // Icons
  "react": "^19.2.0",                  // React library
  "react-dom": "^19.2.0"               // React DOM
}
```

### Adding New Dependencies

**Always check security vulnerabilities before adding:**
```bash
# Backend
cd backend
npm audit
npm install <package-name>

# Frontend
cd frontend
npm audit
npm install <package-name>
```

**Best practices:**
- Keep dependencies up to date but test thoroughly before updating major versions
- Avoid adding new dependencies unless absolutely necessary
- Check bundle size impact for frontend dependencies
- Review license compatibility
- For backend, prefer well-maintained packages with recent updates

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update with caution (may break things)
npm update

# For security fixes only
npm audit fix
```

## CI (example)

### GitHub Actions Workflows

**Node.js Version Notes:**
- `.nvmrc` specifies: 22.12.0 (recommended for local development)
- `package.json` specifies: >=20.19.0 (minimum required version)
- CI uses: 22.12.0 (matches .nvmrc for consistency)

**Node CI - Build & Validate** (`.github/workflows/node-ci.yml`):
- Triggers on push/PR to `main` branch
- Uses Node.js 22.12.0
- Steps:
  1. Installs frontend dependencies (`npm ci`)
  2. Builds frontend (`npm run build`)
  3. Verifies build output exists (`frontend/dist/index.html`)
  4. Installs backend dependencies (`npm ci`)
  5. Checks environment configuration (doesn't fail if GEMINI_API_KEY missing)
  
**Important CI Notes:**
- CI does NOT run the backend server (no API key in CI environment)
- CI does NOT run tests (no test suite exists yet)
- The build step verifies that frontend code compiles successfully
- Backend is only validated for dependency installation
- `backend/check_env.js` exits with code 0 even if API key is missing (CI-safe)

### Making CI-Safe Changes

When modifying code that affects CI:
- Ensure frontend builds successfully: `cd frontend && npm run build`
- Don't add steps requiring secrets/API keys
- Don't add steps requiring external services (databases, APIs)
- Keep build times reasonable (<5 minutes)

### Local Build Testing
```bash
# Test frontend build (what CI runs)
cd frontend
npm run build
ls -la dist/index.html  # Should exist

# Test backend installation
cd backend
npm ci
npm list --depth=0  # Verify dependencies
```

## Security Considerations

**Critical Security Rules:**
1. **Never commit secrets** - API keys, Firebase configs, credentials
2. **API key handling** - Backend logs only 8-character substring
3. **Rate limiting** - Enforce on all public endpoints
4. **CORS** - Restrict to known origins in production
5. **Input validation** - Sanitize all user inputs
6. **Firebase rules** - Implement proper Firestore security rules

### Implemented Security Measures

**Helmet.js Security Headers:**
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- XSS protection
- No-sniff headers

**Rate Limiting:**
- 100 requests per 15 minutes per IP
- Applied to `/api/generate` endpoint
- Configurable in `backend/server.js`

**CORS Configuration:**
- Current: Development mode (all origins)
- Production: Should restrict to specific domains
- Configuration in `backend/server.js`

**Environment Variables:**
- All secrets in `.env` files (gitignored)
- Never hardcode API keys in source
- Use Railway environment variables for production

### Security Checklist for Changes

Before committing code:
- [ ] No API keys or secrets in code
- [ ] `.env` files are gitignored
- [ ] User input is validated/sanitized
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting applied to new endpoints
- [ ] CORS configured for new endpoints
- [ ] Logs don't contain sensitive data
- [ ] Firebase config unchanged (unless explicitly instructed)

### Common Security Pitfalls

**Don't do this:**
```javascript
// ❌ Hardcoded API key
const apiKey = "AIzaSyC...";

// ❌ Exposing full error details to client
res.status(500).json({ error: err.stack });

// ❌ No rate limiting on endpoint
app.post('/api/expensive-operation', handler);

// ❌ Logging sensitive data
logger.info('User password:', password);
```

**Do this instead:**
```javascript
// ✅ Environment variable
const apiKey = process.env.GEMINI_API_KEY;

// ✅ Generic error message
res.status(500).json({ error: "Operation failed" });

// ✅ Rate limited endpoint
app.post('/api/expensive-operation', rateLimiter, handler);

// ✅ Log only metadata
logger.info('User authenticated', { userId: user.id });
```

For detailed security information, see `SECURITY.md` in the repository root.

## Env check helper
- A helper script `backend/check_env.js` was added to print whether `GEMINI_API_KEY` is present in `backend/.env` or the environment. It intentionally hides the value and exits `0` so CI doesn't fail when secrets are absent.
- CI runs this script as an informational step (`.github/workflows/node-ci.yml`) so maintainers can see if the key is configured locally/CI without exposing secrets.

## Deployment

### Local Development
See [How to run / developer workflows](#how-to-run--developer-workflows) section above.

### Production (Railway)
The app is deployed to Railway with the following setup:

**Deployment Method:**
- Automatic deployment on push to `main` branch
- Railway detects the monorepo structure
- Backend and frontend deployed as separate services

**Deployment Scripts:**
```powershell
# Production deployment (from root)
.\deploy-prod.ps1

# Or manual deployment
git push origin main  # Railway auto-deploys
```

**Environment Configuration:**
- Set `GEMINI_API_KEY` in Railway dashboard (backend service)
- Set `NODE_ENV=production` in Railway
- Configure service URLs in Railway for CORS

**Verify Deployment:**
```bash
# Check backend health
curl https://your-railway-url.railway.app/api/models

# Check dashboard
open https://your-railway-url.railway.app/dashboard
```

**Railway Configuration Files:**
- `Procfile` - Defines start command for Railway
- `railway.json` - Railway service configuration
- See `DEPLOYMENT_GUIDE.md` for detailed instructions

### Build Process
```bash
# Frontend build (what CI runs)
cd frontend
npm run build  # Output: frontend/dist/

# Backend uses source files directly (no build step)
cd backend
npm start
```

## Model discovery endpoint
- A diagnostic endpoint was added at `GET /api/models`. It calls the SDK's `listModels()` (when available) and returns an array of model names that support `generateContent`.
- Usage:

```powershell
# Start backend
cd backend
npm ci
npm start

# From a new shell, list supported models
curl http://localhost:3001/api/models
```

- If the SDK version doesn't support `listModels()` the endpoint returns `501` with an explanatory message. If it does return models, pick one that looks like a `gemini` model and set `GENERATIVE_MODEL` in `backend/.env`.

## Key files to inspect for changes

### Critical Files (Change with caution)

**Backend:**
- `backend/server.js` - Main Express server
  - Model selection (currently `gemini-2.0-flash-exp`, configurable via `GENERATIVE_MODEL` env var)
  - Gemini SDK initialization
  - API endpoint definitions
  - Error handling
  - Rate limiting configuration
  - Security headers (helmet)
  - CORS configuration
  - `.env` loading logic

- `backend/.env` - Environment variables (gitignored)
  - `GEMINI_API_KEY` - Required for AI generation
  - `PORT` - Server port (default 3001)
  - `NODE_ENV` - Environment mode

**Frontend:**
- `frontend/src/App.jsx` - Main application (~5000+ lines)
  - All UI components in single file
  - Firebase initialization (hardcoded config)
  - `callGemini()` function for backend calls
  - `BACKEND_URL` constant (local vs production)
  - 8 AI agent sections (Ghostwriter, CipherDojo, CrateDigger, etc.)
  - Authentication logic
  - Firestore integration
  - Wallet/MetaMask mock integration

- `frontend/vite.config.js` - Build configuration
  - Dev server settings
  - Build output configuration
  - Plugin configuration

### Configuration Files

- `package.json` (root) - Monorepo scripts
- `backend/package.json` - Backend dependencies
- `frontend/package.json` - Frontend dependencies
- `frontend/eslint.config.js` - Linting rules
- `.nvmrc` - Node version specification
- `.gitignore` - Git ignore patterns
- `Procfile` - Railway deployment configuration
- `railway.json` - Railway service configuration

### Documentation Files

- `README.md` - Project overview and features
- `START_HERE.md` - Quick start guide for developers
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `API_SETUP_GUIDE.md` - Backend API configuration
- `SECURITY.md` - Security measures and guidelines
- `AGENT_INFO_CONTENT.md` - AI agent capabilities reference

### Support Files

- `backend/check_env.js` - Environment validation script
- `backend/dashboard.html` - Monitoring dashboard
- `.github/workflows/node-ci.yml` - CI/CD pipeline

## Common Pitfalls & Troubleshooting

### Port Conflicts
**Symptom:** `Error: listen EADDRINUSE: address already in use :::3001`

**Solution:**
```powershell
# Kill all Node processes
npm run kill
# Wait 5 seconds, then restart
npm run fresh
```

### Backend Won't Start - Missing API Key
**Symptom:** `Error: GEMINI_API_KEY not found` or backend crashes on startup

**Solution:**
```bash
# Check if key exists
cd backend
node check_env.js

# If missing, add to backend/.env:
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### Frontend Can't Connect to Backend
**Symptom:** `ERROR: BACKEND OFFLINE` or `CONNECTION ERROR` in browser console

**Solution:**
1. Verify backend is running: `curl http://localhost:3001/api/models`
2. Check `BACKEND_URL` in `App.jsx` matches your backend port
3. Ensure CORS is configured in `backend/server.js`
4. Check backend logs in `backend/logs/error.log`

### Build Failures
**Symptom:** `npm run build` fails with errors

**Solution:**
```bash
# Frontend build issues
cd frontend
npm run lint              # Check for linting errors
rm -rf node_modules       # Clean install
npm install
npm run build

# Check for syntax errors in App.jsx
```

### Firebase Configuration Issues
**Symptom:** Firebase auth/firestore not working

**Solution:**
- Check Firebase config object in `App.jsx` (hardcoded)
- Verify Firebase project is active in Firebase Console
- Check browser console for Firebase errors
- Ensure Firestore security rules are deployed

### Dependency Installation Failures
**Symptom:** `npm install` fails with errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove lock files and reinstall
rm package-lock.json
rm -rf node_modules
npm install

# If still failing, check Node version
node --version  # Should be 20.19.0+
```

### Vite Dev Server Issues
**Symptom:** HMR not working, constant reloads, or slow updates

**Solution:**
- Close other terminals running `npm run dev`
- Run `npm run kill` to clear all Node processes
- Check for file watchers limit on Linux: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`
- Restart Vite dev server

### Git Accidentally Committed Secrets
**Symptom:** `.env` file or API keys in git history

**Solution:**
```bash
# DON'T DO THIS - it requires force push
# Instead, immediately:
1. Revoke the exposed API key in Google AI Studio
2. Generate new key
3. Update backend/.env with new key
4. Verify .gitignore includes .env
5. Contact repository maintainer
```

## External integrations & risks
- Uses `@google/generative-ai` in the backend; changes to model or SDK usage must be made in `backend/server.js` and tested locally with a valid `GEMINI_API_KEY`.
- Uses Firebase (auth + Firestore) directly in the frontend. Keys are present in source — avoid committing alternative secret keys. Treat the Firebase project as live.
- Frontend contains a simple wallet/META mask integration for a mock minting flow (`PressingPlant`) — this is a UI stub and not production-ready.

## What the AI agent should not do

**Never do these things:**

1. **Don't commit secrets**
   - No API keys in source code
   - No `.env` files in commits
   - Backend logs only 8-char substring of keys by design
   - Never hardcode Firebase credentials beyond the existing config

2. **Don't change Firebase config unless explicitly instructed**
   - Config is intentionally hard-coded in `App.jsx`
   - Treat the Firebase project as live/production
   - Changing config could break authentication for real users

3. **Don't remove or modify working features**
   - The app has 8 AI agents - don't remove any unless instructed
   - Don't refactor working code into smaller files (keep App.jsx as single file)
   - Don't "improve" code organization unless specifically asked

4. **Don't add unnecessary dependencies**
   - Use existing libraries when possible
   - Check bundle size impact before adding frontend deps
   - Prefer built-in JavaScript/Node.js features
   - Don't add testing frameworks without discussion

5. **Don't break the monorepo structure**
   - Keep backend and frontend as separate packages
   - Don't move files between backend/frontend
   - Don't create new top-level directories without reason

6. **Don't modify CI without understanding**
   - CI is intentionally simple and safe
   - Don't add steps that require API keys
   - Don't add steps that require external services
   - Test CI changes with `npm run build` first

7. **Don't change module systems**
   - Backend must remain CommonJS (`require`/`module.exports`)
   - Frontend must remain ES modules (`import`/`export`)
   - Don't mix module systems in same package

8. **Don't log sensitive information**
   - No passwords, API keys, or tokens in logs
   - Use Winston logger, not console.log
   - Log only metadata (user IDs, not user data)

9. **Don't expose internal errors to clients**
   - Return generic error messages to frontend
   - Log detailed errors server-side only
   - Don't leak stack traces or file paths

10. **Don't bypass rate limiting**
    - Keep rate limits on all public endpoints
    - Don't increase limits without discussion
    - Don't add unrestricted endpoints

## Small actionable examples for changes

### Change the AI model
**File:** `backend/server.js`
```javascript
// Find this line (around line 307)
const desiredModel = process.env.GENERATIVE_MODEL || "gemini-2.0-flash-exp";

// Option 1: Change default in code
const desiredModel = process.env.GENERATIVE_MODEL || "gemini-1.5-pro";

// Option 2: Set environment variable (preferred)
// In backend/.env, add:
// GENERATIVE_MODEL=gemini-1.5-pro
```

### Change backend URL in frontend
**File:** `frontend/src/App.jsx`
```javascript
// Find isLocal detection (around line 50)
const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';

const BACKEND_URL = isLocal 
  ? 'http://localhost:3001/api/generate'
  : 'https://your-railway-url.railway.app/api/generate';
```

### Add a new API endpoint
**File:** `backend/server.js`
```javascript
// Add after existing endpoints (around line 100)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});
```

### Change rate limiting
**File:** `backend/server.js`
```javascript
// Find rate limiter config (around line 40)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Change time window
  max: 100                    // Change max requests
});
```

### Update CORS for production
**File:** `backend/server.js`
```javascript
// Find CORS config (around line 35)
const allowedOrigins = [
  'https://your-frontend-domain.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### Add environment variable
**Files:** `backend/.env` and `backend/server.js`
```bash
# In backend/.env
NEW_CONFIG_VALUE=something

# In backend/server.js
const newConfig = process.env.NEW_CONFIG_VALUE || 'default';
```

### Add a new AI agent to frontend
**File:** `frontend/src/App.jsx`
```javascript
// Add new agent button in the agents list (around line 500)
<button
  onClick={() => setCurrentSection('NewAgent')}
  className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-700"
>
  <Icon /> New Agent Name
</button>

// Add new agent section in the render logic (around line 1500)
{currentSection === 'NewAgent' && (
  <div className="space-y-4">
    {/* Agent UI here */}
  </div>
)}
```

### Modify frontend build output directory
**File:** `frontend/vite.config.js`
```javascript
export default defineConfig({
  // ... existing config
  build: {
    outDir: 'dist',  // Change output directory
    assetsDir: 'assets'
  }
})
```

## Additional Resources

If anything looks incomplete or you'd like more examples (unit tests, deployment details, or specific workflows), refer to:
- `START_HERE.md` - Quick troubleshooting guide
- `DEPLOYMENT_GUIDE.md` - Railway deployment process  
- `API_SETUP_GUIDE.md` - Backend configuration details
- `SECURITY.md` - Comprehensive security guidelines
- `AGENT_INFO_CONTENT.md` - AI agent feature descriptions

When in doubt, ask for clarification before making significant changes.
