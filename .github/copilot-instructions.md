# Copilot Instructions for AI Coding Agents

This repository is a two-part app: a Node/Express backend that proxies Google Gemini (Gemini SDK) and a React/Vite frontend using Firebase. Use these notes to make productive, low-risk code changes.

## Table of Contents
1. [Quick Architecture](#quick-architecture-big-picture)
2. [Task Scoping for AI Agents](#task-scoping-for-ai-agents)
3. [Iterative Workflow with Copilot](#iterative-workflow-with-copilot)
4. [Developer Workflows](#how-to-run--developer-workflows)
5. [Linting & Code Quality](#linting--code-quality)
6. [Testing](#testing)
7. [API Contract](#api-contract-be-explicit)
8. [Project Conventions](#project-specific-conventions--patterns)
9. [Context Optimization](#context-optimization-tips)
10. [Dependencies](#dependency-management)
11. [CI/CD](#ci-example)
12. [Security](#security-considerations)
13. [Error Recovery Patterns](#error-recovery-patterns)
14. [Performance Guidelines](#performance-guidelines)
15. [API Rate Limits & Quotas](#api-rate-limits--quotas)
16. [Firebase Configuration](#firebase-configuration--rules)
17. [Monitoring & Observability](#monitoring--observability)
18. [Version Compatibility](#version-compatibility-matrix)
19. [Rollback Procedures](#rollback-procedures)
20. [Key Files](#key-files-to-inspect-for-changes)
21. [Common Pitfalls](#common-pitfalls--troubleshooting)
22. [External Integrations](#external-integrations--risks)
23. [What Not to Do](#what-the-ai-agent-should-not-do)
24. [Code Review Checklist](#code-review-checklist)
25. [Testing Strategy](#testing-strategy)
26. [Git Workflow](#git-workflow-standards)
27. [Performance Benchmarks](#performance-benchmarks)
28. [Cost Optimization](#cost-optimization)
29. [Examples](#small-actionable-examples-for-changes)

## Quick architecture (big picture)
- **Backend:** `backend/server.js` — Express API that reads `backend/.env` for `GEMINI_API_KEY`, initializes `GoogleGenerativeAI`, and exposes `POST /api/generate` which returns JSON `{ output: string }`.
- **Frontend:** `frontend/src/App.jsx` — single-file React app (many UI sections) that uses Firebase for auth/firestore and calls the backend via `callGemini()` to generate text. `BACKEND_URL` is toggled by `isLocal` (localhost:3001) or production placeholder.
- **Integration flow:** Frontend -> POST `/api/generate` -> Backend uses `@google/generative-ai` -> responds `{ output }`. Firebase is used locally for state/auth (keys are bundled in `App.jsx`).

## Task Scoping for AI Agents

Understanding which tasks are appropriate for AI agents vs. human developers is critical for success.

### ✅ Ideal Tasks for AI Agents

**Bug Fixes:**
- Fixing linting errors in specific files
- Correcting typos in documentation
- Fixing broken links or outdated references
- Resolving minor logic errors with clear reproduction steps

**Adding Tests:**
- Writing unit tests for existing functions
- Adding test cases for edge conditions
- Creating integration tests for API endpoints
- Expanding test coverage for specific modules

**Documentation:**
- Updating README files
- Adding JSDoc comments to functions
- Creating or updating API documentation
- Writing inline code comments for complex logic

**Minor Refactoring:**
- Extracting repeated code into functions
- Renaming variables for clarity
- Reformatting code to match style guides
- Breaking large functions into smaller ones

**Feature Additions (Small Scope):**
- Adding new API endpoints with clear specs
- Creating new UI components based on existing patterns
- Adding configuration options with defaults
- Implementing feature flags

### ❌ Tasks to Avoid Assigning to AI Agents

**Security-Critical Code:**
- Authentication/authorization logic
- Encryption/decryption implementations
- API key management or rotation
- Firebase security rules (review only, don't auto-generate)
- Input sanitization for user data

**Large Architectural Changes:**
- Migrating between frameworks (e.g., React to Vue)
- Changing database systems
- Refactoring entire application structure
- Splitting monoliths into microservices

**Cross-Repository Work:**
- Changes affecting multiple repositories
- Coordinated deployments across services
- Dependency updates requiring sync across repos

**Business-Critical Logic:**
- Payment processing
- User data handling
- Financial calculations
- Legal/compliance-related code

**Ambiguous Requirements:**
- Tasks with unclear success criteria
- "Improve performance" without metrics
- "Make it better" without specifics
- Exploration tasks without defined outcomes

### Task Size Guidelines

- **Ideal:** Can be completed in 1-3 files, <200 lines changed
- **Acceptable:** 3-5 files, <500 lines changed
- **Risky:** >5 files or >500 lines changed (break into smaller tasks)

### How to Write Effective Task Descriptions

**Good Example:**
```
Add a new GET /api/health endpoint to backend/server.js that returns:
- status: "healthy" 
- uptime: process.uptime()
- timestamp: ISO string
Return 200 status code. Add rate limiting using existing limiter pattern.
```

**Bad Example:**
```
Make the backend better and add health checks somewhere
```

## Iterative Workflow with Copilot

AI agents work best with clear feedback loops and iterative refinement.

### How to Request Changes

**Tag @copilot in PR comments:**
```markdown
@copilot The error handling in line 45 should use the logger instead of console.log
```

**Be specific about what needs to change:**
```markdown
@copilot Change the rate limit from 100 to 50 requests per 15 minutes in backend/server.js
```

**Request clarification if needed:**
```markdown
@copilot Can you explain why you used setTimeout here instead of setInterval?
```

### When to Tag @copilot for Revisions

✅ **Do tag @copilot when:**
- Code doesn't match the requested behavior
- Linting errors need to be fixed
- Security concerns need addressing
- Performance issues are evident
- Tests are failing
- Documentation is incomplete or unclear

❌ **Don't tag @copilot for:**
- Merge conflicts (handle manually)
- Decisions requiring business context
- Architecture discussions
- Questions about requirements
- Praise or "looks good" comments

### Expected Self-Review Patterns

Before submitting a PR, AI agents should:
1. Run linters (`npm run lint` in frontend)
2. Build the project (`npm run build` in frontend)
3. Check for console.log statements (should use logger)
4. Verify no secrets are committed
5. Test endpoints with curl (backend changes)
6. Verify UI changes in browser (frontend changes)
7. Check that all referenced files exist
8. Ensure code examples have correct line numbers

### Iteration Cycle

1. **Initial PR submitted** by AI agent
2. **Human review** - leave specific comments
3. **AI responds** to comments with fixes
4. **Verification** - human checks fixes
5. **Merge** when approved, or repeat cycle

Typical iterations: 1-3 rounds for simple tasks, 3-5 for complex ones.

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

## Context Optimization Tips

Maximizing Copilot's understanding of your codebase leads to better, more accurate code generation.

### Files to Have Open

**For Backend Work:**
1. `backend/server.js` - Main server file (always)
2. `backend/package.json` - Dependencies and scripts
3. `backend/.env.example` or similar - Environment variables reference
4. Related endpoint handlers or middleware being modified

**For Frontend Work:**
1. `frontend/src/App.jsx` - Main application file (always)
2. `frontend/package.json` - Dependencies and scripts
3. `frontend/vite.config.js` - Build configuration
4. `frontend/eslint.config.js` - Linting rules

**For Full-Stack Changes:**
- Open both backend and frontend files mentioned above
- Include any shared type definitions or constants
- Have API documentation or contract files visible

### How to Structure Prompts

**✅ Good Prompt Structure:**
```
Task: Add user profile caching
Context: Backend uses Express with in-memory storage
Files: backend/server.js around line 200
Requirements:
- Cache profile for 5 minutes
- Use Map() for storage
- Clear on user logout
- Add cache hit/miss logging
```

**❌ Poor Prompt Structure:**
```
Add caching
```

### Effective Prompt Patterns

**Pattern 1: Context + Task + Constraints**
```
In backend/server.js, add input validation to /api/generate endpoint.
Validate that prompt is string, 1-5000 chars. Return 400 if invalid.
Use existing error response pattern.
```

**Pattern 2: Reference Existing Patterns**
```
Add a new /api/status endpoint following the same pattern as /api/models.
Return server uptime, memory usage, and active connections.
```

**Pattern 3: Specify Testing**
```
Add password reset functionality to User model.
Include validation, email sending stub, and token expiry.
Add manual test instructions in comments.
```

### Using Inline Comments as Hints

**Guide complex logic:**
```javascript
// TODO: Refactor this function to use async/await instead of callbacks
function processData(data, callback) {
  // This needs error handling for network failures
  // Should retry 3 times with exponential backoff
}
```

**Mark sections for AI attention:**
```javascript
// AI: This function needs optimization - it's called 1000x/sec
function calculateScore(user) {
  // Current O(n²) - should be O(n log n)
}
```

**Provide context for decisions:**
```javascript
// Using gemini-2.0-flash-exp instead of gemini-1.5-pro for cost savings
// Can switch if quality issues arise - see DEPLOYMENT_GUIDE.md
const model = "gemini-2.0-flash-exp";
```

### Context Window Best Practices

1. **Keep related code together** - Don't spread logic across many files unnecessarily
2. **Use clear naming** - Function/variable names should explain purpose
3. **Add module-level comments** - Explain file's role in architecture
4. **Reference docs** - Point to SECURITY.md, API_SETUP_GUIDE.md in comments
5. **Show examples** - Include sample input/output in comments

### When Context is Limited

If working in a large file (like `App.jsx` with 5000+ lines):
- Add a comment at the top describing sections
- Use clear section markers with comments
- Reference line numbers in task descriptions
- Break changes into smaller, focused tasks

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

## Error Recovery Patterns

When things go wrong, follow these specific recovery steps for common failure scenarios.

### API Key Expired or Invalid

**Symptoms:**
- `Error: GEMINI_API_KEY not found` in backend logs
- 401 Unauthorized responses from Gemini API
- Backend crashes on startup

**Recovery Steps:**
1. Verify key exists: `cd backend && node check_env.js`
2. Check Google AI Studio dashboard for key status
3. Generate new key if expired/revoked
4. Update `backend/.env`: `GEMINI_API_KEY=new_key_here`
5. Restart backend: `npm run kill && npm run backend`
6. Test with: `curl http://localhost:3001/api/models`

**Prevention:**
- Set calendar reminder to rotate keys every 90 days (production)
- Development keys can be rotated less frequently (180 days)
- Monitor backend logs for authentication errors
- Keep backup key in secure location (not in git)

### Firebase Quota Exceeded

**Symptoms:**
- "Quota exceeded" errors in browser console
- Failed Firestore read/write operations
- 429 errors from Firebase

**Recovery Steps:**
1. Check Firebase Console → Usage tab
2. Identify quota type exceeded (reads, writes, storage)
3. **Immediate workaround:**
   - Clear browser localStorage to reset local cache
   - Reduce polling frequency in frontend
   - Implement client-side caching
4. **Long-term fix:**
   - Upgrade Firebase plan if needed
   - Optimize query patterns (use where clauses)
   - Implement pagination for large datasets
   - Add request debouncing

**Prevention:**
- Set up Firebase billing alerts
- Monitor daily usage in dashboard
- Implement query result caching
- Use Firebase SDK modularly (only import what you need)

### Rate Limit Hit on Gemini API

**Symptoms:**
- 429 responses from `/api/generate`
- "Rate limit exceeded" in error logs
- Slow or failed AI generation

**Recovery Steps:**
1. Check current rate limit: See `backend/server.js` line ~40
2. **Immediate mitigation:**
   ```bash
   # Temporarily reduce limit if under attack
   # Edit backend/server.js, change max: 100 to max: 50
   npm run backend
   ```
3. **Check for abuse:**
   ```bash
   # View recent requests in logs
   cat backend/logs/combined.log | grep "/api/generate" | tail -50
   ```
4. **Wait for window reset:** Default is 15 minutes
5. Switch to lower-cost model if budget exhausted:
   - Edit `GENERATIVE_MODEL` in `.env` to `gemini-1.5-flash`

**Prevention:**
- Implement user-level rate limiting (not just IP-based)
- Add request costs to user profiles
- Cache common prompts/responses
- Set up monitoring alerts for unusual traffic

### Build Failures in Production

**Symptoms:**
- Railway deployment fails
- `npm run build` errors locally
- Frontend shows blank page

**Recovery Steps:**
1. **Check CI logs:**
   ```bash
   # Get recent workflow runs
   gh run list --branch main
   # View failed run details
   gh run view <run-id>
   ```

2. **Reproduce locally:**
   ```bash
   cd frontend
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Common fixes:**
   - **ESLint errors:** Run `npm run lint` and fix issues
   - **Missing dependencies:** Check package.json vs imports
   - **Environment vars:** Ensure Vite vars prefixed with `VITE_`
   - **Type errors:** Check for undefined props in components

4. **Emergency rollback:**
   ```bash
   git revert HEAD~1  # Revert last commit
   git push origin main
   ```

**Prevention:**
- Always run `npm run build` before committing frontend changes
- Enable pre-commit hooks for linting
- Test build in CI before merge
- Keep dependencies up to date

### Database Connection Lost

**Symptoms:**
- Firebase/Firestore errors in console
- "Network error" messages
- Users can't save data

**Recovery Steps:**
1. Check Firebase Console → Status Dashboard
2. Verify network connectivity
3. Check browser console for CORS errors
4. **Clear Firebase cache:**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```
5. Verify Firebase config in `App.jsx` matches console

**Prevention:**
- Implement offline persistence with Firebase
- Add connection status indicator in UI
- Use exponential backoff for retries
- Log connection errors server-side

### Port Already in Use

**Symptoms:**
- `EADDRINUSE :::3001` or `:::5173`
- Backend/frontend won't start

**Recovery Steps:**
1. Kill all Node processes:
   ```bash
   npm run kill
   ```
2. Wait 5 seconds, then restart
3. If that fails, manually find and kill:
   ```bash
   # Find process using port 3001
   lsof -i :3001
   # Kill specific PID
   kill -9 <PID>
   ```

**Prevention:**
- Always use `npm run kill` before starting
- Use `npm run fresh` which kills then starts
- Close terminals properly instead of force-quit

## Performance Guidelines

Know when code changes require performance consideration and optimization.

### When Performance Matters

**Critical (Always Optimize):**
- Database queries returning >1000 records
- File uploads >10MB
- API endpoints called >100 times/minute
- Real-time features (chat, notifications)
- Loop iterations >10,000

**Important (Optimize if Slow):**
- Page load time >3 seconds
- API response time >500ms
- Frontend bundle size >2MB
- Memory usage growing over time

**Nice-to-Have (Optimize Later):**
- Admin-only pages
- One-time setup tasks
- Internal tools with <10 users

### Frontend Performance Patterns

**Large File Uploads:**
```javascript
// ❌ Don't load entire file into memory
const buffer = await file.arrayBuffer();

// ✅ Use chunked uploads
const chunkSize = 1024 * 1024; // 1MB chunks
for (let start = 0; start < file.size; start += chunkSize) {
  const chunk = file.slice(start, start + chunkSize);
  await uploadChunk(chunk);
}
```

**Firestore Query Optimization:**
```javascript
// ❌ Inefficient - fetches all then filters
const allPosts = await getDocs(collection(db, 'posts'));
const userPosts = allPosts.filter(p => p.userId === uid);

// ✅ Efficient - query with where clause
const q = query(
  collection(db, 'posts'),
  where('userId', '==', uid),
  limit(20)
);
const userPosts = await getDocs(q);
```

**Bundle Size Impact:**
```javascript
// ❌ Imports entire lodash (>50KB)
import _ from 'lodash';

// ✅ Import only what you need
import debounce from 'lodash/debounce';
```

**React Rendering Optimization:**
```javascript
// ❌ Creates new object every render
<Component config={{ timeout: 1000 }} />

// ✅ Memoize or define outside
const config = { timeout: 1000 };
<Component config={config} />
```

### Backend Performance Patterns

**Memory Usage:**
```javascript
// ❌ Stores unlimited data in memory
const cache = new Map();
app.post('/api/data', (req, res) => {
  cache.set(req.body.id, req.body.data);
});

// ✅ Implement cache eviction (example with lru-cache package)
// Note: Requires `npm install lru-cache` if implementing
const LRU = require('lru-cache');
const cache = new LRU({ max: 500, ttl: 1000 * 60 * 5 });
```

**Database Connection Pooling:**
```javascript
// ✅ Reuse Firebase instance (already implemented)
// Don't create new Firebase app per request
const firebase = getApps().length ? getApp() : initializeApp(config);
```

**Response Time Optimization:**
```javascript
// ❌ Sequential API calls
const user = await getUser(id);
const posts = await getPosts(id);
const comments = await getComments(id);

// ✅ Parallel API calls
const [user, posts, comments] = await Promise.all([
  getUser(id),
  getPosts(id),
  getComments(id)
]);
```

### Performance Monitoring

**Backend (Winston Logs):**
```javascript
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;
if (duration > 1000) {
  logger.warn('Slow operation', { operation: 'generateText', duration });
}
```

**Frontend (Performance API):**
```javascript
const mark = performance.mark('api-call-start');
await callGemini(prompt);
performance.measure('api-call', 'api-call-start');
const measure = performance.getEntriesByName('api-call')[0];
console.log('API call took', measure.duration, 'ms');
```

### Performance Budgets

Enforce these limits:
- **Frontend bundle:** <2MB gzipped
- **API response time:** <500ms (p95)
- **Page load:** <3 seconds (LCP)
- **Memory usage:** <512MB backend process
- **Firestore reads:** <50,000/day (free tier)
- **Gemini API calls:** <100/hour (budget dependent)

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

## API Rate Limits & Quotas

Understanding API limits prevents unexpected failures and helps with cost planning.

### Gemini API Limits

**Free Tier (No Payment Method):**
- Requests per minute (RPM): 15
- Requests per day (RPD): 1,500
- Tokens per minute (TPM): 1,000,000

**Pay-as-you-go:**
- Requests per minute (RPM): 360
- Requests per day (RPD): 10,000
- Tokens per minute (TPM): 10,000,000

**Current Configuration:**
- Rate limit in backend: 100 requests / 15 minutes per IP
- Model: `gemini-2.0-flash-exp` (cost varies by model)
- Verify latest pricing: https://ai.google.dev/pricing

**Monitoring Usage:**
```bash
# Check recent API calls
cat backend/logs/combined.log | grep "AI Generation Success" | wc -l

# View response times
cat backend/logs/combined.log | grep "generationTime"
```

**Cost Optimization Strategies:**
1. Cache common responses (not implemented yet)
2. Use shorter system instructions
3. Limit prompt length (currently 5000 chars max)
4. Switch to cheaper models when appropriate
5. Implement user quotas in frontend

### Firebase Limits

**Firestore (Spark/Free Plan):**
- Document reads: 50,000/day
- Document writes: 20,000/day
- Document deletes: 20,000/day
- Storage: 1 GB
- Network egress: 10 GB/month

**Firestore (Blaze/Pay-as-you-go):**
- Reads: $0.06 per 100,000
- Writes: $0.18 per 100,000
- Deletes: $0.02 per 100,000
- Storage: $0.18 GB/month

**Authentication:**
- Phone auth: 10,000 verifications/month free
- Email/password: Unlimited (free)

**Monitoring:**
1. Firebase Console → Usage tab
2. Set up billing alerts
3. Track queries in application logs

**Current Usage Patterns:**
- Anonymous auth on frontend load
- Firestore for user posts/comments
- No heavy query operations currently

### Express Rate Limiting

**Current Configuration** (`backend/server.js`):
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window per IP
  message: 'Too many requests, please try again later'
});
```

**Applied to:**
- `/api/generate` endpoint

**Not Applied to:**
- `/api/models` (diagnostics)
- `/dashboard` (monitoring)
- Health check endpoints

**Recommendations:**
- Add rate limiting to all public endpoints
- Implement user-based (not just IP-based) limits
- Lower limits in production (e.g., 50/15min)

## Firebase Configuration & Rules

### Current Firebase Setup

**Configuration Location:** `frontend/src/App.jsx` (hardcoded)

**Services Used:**
- **Authentication:** Anonymous auth for demo purposes
- **Firestore:** Database for posts, comments, user data
- **Storage:** Not currently implemented

**Important:** Firebase config is intentionally hardcoded in `App.jsx`. Do not move to environment variables or separate config file without explicit instruction.

### Security Rules (Recommended)

**Firestore Rules** (deploy via Firebase Console):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Posts collection
    match /posts/{postId} {
      // Anyone authenticated can read
      allow read: if request.auth != null;
      // Only owner can create/update/delete their posts
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null 
        && request.auth.uid == userId;
      // Users can write their own data
      allow write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Storage Rules** (if implemented):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile images
    match /profiles/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024  // 5MB limit
        && request.resource.contentType.matches('image/.*');
    }
    
    // Audio files for Lost Tapes
    match /audio/{userId}/{fileName} {
      allow read: if true;  // Public read
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 50 * 1024 * 1024  // 50MB limit
        && request.resource.contentType.matches('audio/.*');
    }
  }
}
```

### Deploying Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init firestore
firebase init storage

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### Testing Rules Locally

```bash
# Run emulator
firebase emulators:start --only firestore

# Test in code by connecting to emulator
# (see Firebase docs for connection details)
```

## Monitoring & Observability

### Backend Monitoring

**Winston Logs Location:** `backend/logs/`
- `error.log` - Errors only
- `combined.log` - All log levels

**Log Levels:**
- `error` - System failures, unhandled exceptions
- `warn` - Rate limits hit, suspicious activity
- `info` - Normal operations, API calls
- `debug` - Development-only verbose logging (enabled when NODE_ENV=development)

**Viewing Logs:**
```bash
# Tail error logs
tail -f backend/logs/error.log

# Search for specific errors
grep "GEMINI_API_KEY" backend/logs/error.log

# Count API calls today
grep "$(date +%Y-%m-%d)" backend/logs/combined.log | grep "/api/generate" | wc -l

# View slow requests (>1000ms)
grep "generationTime" backend/logs/combined.log | grep -E "[0-9]{4,}"
```

**Dashboard Access:**
- Local: `http://localhost:3001/dashboard`
- Production: `https://your-railway-url.railway.app/dashboard`

**Dashboard Features:**
- Health metrics
- Memory usage
- Request analytics
- Error logs
- Model information

### Frontend Monitoring

**Browser Console:**
- Network tab for API call inspection
- Console for error messages
- Application tab for localStorage/Firebase data

**Firebase Console:**
- Authentication → Users tab
- Firestore → Data viewer
- Usage tab for quota monitoring

**Performance Metrics:**
```javascript
// Check bundle size after build
cd frontend
npm run build
ls -lh dist/*.js
# Should be < 2MB total

// Runtime performance
performance.getEntriesByType('navigation')[0].loadEventEnd
// Should be < 3000ms
```

### Setting Up Alerts

**Railway (Production):**
1. Railway Dashboard → Project Settings
2. Add notification webhooks
3. Configure for deployment failures, crashes

**Firebase (Optional):**
1. Firebase Console → Project Settings
2. Integrations → Cloud Monitoring
3. Set up budget alerts

**Winston (Backend):**
```javascript
// Add email notification for errors (optional)
// Requires email transport setup
logger.error('Critical error', { 
  error: err.message,
  notify: true  // Custom flag for alert system
});
```

## Version Compatibility Matrix

Ensure all dependencies work together to avoid runtime errors.

### Current Versions

**Node.js:**
- Required: 20.19.0+
- Recommended: 22.12.0 (from `.nvmrc`)
- CI: 22.12.0

**Backend Dependencies:**
| Package | Version | Notes |
|---------|---------|-------|
| Node.js | 22.12.0 | Current version (minimum: 20.19.0) |
| Express | ^5.2.1 | Latest stable |
| @google/generative-ai | ^0.24.1 | Gemini SDK |
| Firebase Admin | N/A | Not used in backend |
| Winston | ^3.19.0 | Logging |
| Helmet | ^8.1.0 | Security headers |

**Frontend Dependencies:**
| Package | Version | Notes |
|---------|---------|-------|
| React | ^19.2.0 | Latest stable |
| React DOM | ^19.2.0 | Matches React |
| Firebase | ^12.6.0 | Client SDK |
| Vite | ^7.2.4 | Build tool |
| Lucide React | ^0.556.0 | Icons |

### Compatibility Notes

**React 19.2.0:**
- Compatible with Vite 7.2.4
- Uses new JSX transform (no need for `import React`)
- React Server Components not used in this project

**Firebase 12.6.0:**
- Compatible with React 19
- Uses modular SDK (v9+ syntax)
- Tree-shaking enabled for smaller bundles

**Express 5.2.1:**
- Breaking changes from v4:
  - Promise rejection handling changed
  - Middleware signature unchanged
- Async/await support improved

**Gemini SDK 0.24.1:**
- Requires Node 20.19.0+
- Supports streaming (not implemented yet)
- Model names updated (use `gemini-2.0-flash-exp`)

### Upgrade Guidelines

**Before upgrading major versions:**
1. Read changelog for breaking changes
2. Test in local development first
3. Check GitHub issues for known problems
4. Update one package at a time
5. Run full build and manual tests
6. Update this compatibility matrix

**Safe to upgrade (minor/patch):**
- Patch versions (e.g., 1.2.3 → 1.2.4)
- Minor versions with caution (e.g., 1.2.0 → 1.3.0)

**Risky upgrades (major):**
- React 19 → 20 (when released)
- Express 5 → 6 (not released yet)
- Firebase 12 → 13 (when released)
- Node 22 → 23

### Checking for Updates

```bash
# Check outdated packages
cd backend && npm outdated
cd frontend && npm outdated

# Security vulnerabilities
npm audit

# Update with caution
npm update  # Updates within semver range
```

## Rollback Procedures

Quick recovery when deployments go wrong.

### Production Rollback (Railway)

**Method 1: Redeploy Previous Version**
```bash
# View recent commits
git log --oneline -5

# Reset to previous commit (don't force push)
git revert HEAD
git push origin main
# Railway auto-deploys the reverted state
```

**Method 2: Railway Dashboard**
1. Go to Railway project
2. Click on deployment history
3. Find last working deployment
4. Click "Redeploy" button

**Method 3: Git Reset (Emergency)**
```bash
# Only if revert doesn't work
git reset --hard HEAD~1
git push --force origin main
# ⚠️ Use with caution - loses commit history
```

### Local Rollback

**Undo Recent Changes:**
```bash
# Discard uncommitted changes
git checkout -- .

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Database Rollback (Firestore)

**No built-in rollback!** Prevention is critical:

**Backup Strategy:**
1. Export data before major changes:
```bash
# Using Firebase CLI
firebase firestore:export backup-$(date +%Y%m%d)
```

2. Restore from backup:
```bash
firebase firestore:import backup-20241201
```

**Manual Recovery:**
- Firestore has automatic backups (paid plans)
- Free tier: No automatic backups
- Implement application-level versioning for critical data

### Dependency Rollback

**If update breaks application:**
```bash
# Backend
cd backend
npm install package-name@previous-version

# Frontend  
cd frontend
npm install package-name@previous-version

# Commit package-lock.json
git add package-lock.json
git commit -m "Rollback package-name to previous-version"
```

### Configuration Rollback

**Environment Variables (Railway):**
1. Railway Dashboard → Variables
2. View history
3. Restore previous value
4. Trigger redeploy

**Firebase Rules:**
```bash
# Rules are versioned in Firebase Console
# Go to Firestore → Rules → View History
# Select previous version → Publish
```

### Emergency Contacts

If rollback doesn't work:
1. Check Railway status page
2. Review Firebase status
3. Check Gemini API status
4. Contact repository maintainer: @Jari57

### Post-Rollback Checklist

- [ ] Verify application loads
- [ ] Test critical user flows
- [ ] Check error logs cleared
- [ ] Notify users if needed
- [ ] Document incident
- [ ] Plan fix for rolled-back feature

## Build Process
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

## Code Review Checklist

Before submitting a PR, AI agents should verify these items:

### Code Quality
- [ ] No `console.log` statements (use `logger` instead)
- [ ] No hardcoded values that should be environment variables
- [ ] Error handling implemented for all async operations
- [ ] No unused variables or imports
- [ ] Functions have clear, descriptive names
- [ ] Complex logic has explanatory comments

### Security
- [ ] No API keys or secrets in code
- [ ] User input is validated/sanitized
- [ ] Error messages don't leak sensitive information
- [ ] Rate limiting applied to new endpoints
- [ ] CORS configured properly for new routes
- [ ] No SQL injection vulnerabilities (if using SQL)

### Performance
- [ ] No N+1 query problems
- [ ] Large datasets use pagination
- [ ] API responses cached when appropriate
- [ ] No memory leaks (event listeners cleaned up)
- [ ] Bundle size impact acceptable (<100KB added)

### Testing
- [ ] Manually tested all changed functionality
- [ ] Edge cases considered and handled
- [ ] Error paths tested
- [ ] Works in both development and production modes
- [ ] Mobile responsive (frontend changes)

### Documentation
- [ ] README updated if user-facing changes
- [ ] Inline comments added for complex logic
- [ ] API documentation updated if endpoints changed
- [ ] Environment variables documented in .env.example

### Git Hygiene
- [ ] Commit messages are descriptive
- [ ] No merge conflicts
- [ ] No unrelated changes included
- [ ] .gitignore prevents committing build artifacts
- [ ] Branch is up to date with main

### Frontend Specific
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No React warnings in console
- [ ] Accessibility considered (ARIA labels, keyboard nav)
- [ ] Works in Chrome, Firefox, Safari

### Backend Specific
- [ ] Winston logger used (not console.log)
- [ ] Environment variables loaded correctly
- [ ] API endpoints follow RESTful conventions
- [ ] Proper HTTP status codes used
- [ ] Request/response validated

## Testing Strategy

When to test manually vs. relying on CI, and what to test.

### No Automated Tests Exist

**Current State:** This repository has no test suite yet.

**Implications:**
- All changes must be manually tested
- CI only checks build/lint, not functionality
- Risk of regressions is higher
- Manual testing is critical before merge

### Manual Testing Requirements

**For Every PR:**
1. **Backend changes:**
   ```bash
   # Start backend
   npm run backend
   
   # Test with curl
   curl -X POST http://localhost:3001/api/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt":"test","systemInstruction":"brief"}'
   ```

2. **Frontend changes:**
   - Open browser at `http://localhost:5173`
   - Test changed functionality visually
   - Check browser console for errors
   - Test on mobile viewport (DevTools)

3. **Full-stack changes:**
   - Test frontend → backend → AI flow
   - Verify error handling
   - Check network tab for API calls

### When to Add Tests

**Add tests when:**
- Bug fix (test should fail before fix, pass after)
- Complex business logic added
- Critical user flows implemented
- Refactoring large sections of code

**Don't add tests for:**
- Simple UI tweaks
- Documentation changes
- Configuration updates
- One-time migration scripts

### Future Test Strategy

**When tests are added, priority order:**

1. **Critical Path Tests (High Priority):**
   - User authentication flow
   - AI text generation (`/api/generate`)
   - Firebase data persistence
   - Error handling for API failures

2. **Integration Tests (Medium Priority):**
   - Backend API endpoints
   - Firebase security rules
   - Rate limiting behavior
   - CORS configuration

3. **Unit Tests (Nice-to-Have):**
   - Utility functions
   - Data validation logic
   - UI component behavior

### Testing Tools Recommendations

**Backend:**
- Jest for unit tests
- Supertest for API tests
- Mock Gemini API responses

**Frontend:**
- Vitest (built into Vite)
- React Testing Library
- Mock Firebase with emulators

## Git Workflow Standards

Branch naming, commit messages, and PR conventions.

### Branch Naming

**Format:** `type/short-description`

**Types:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

**Examples:**
```
feature/add-user-profiles
fix/rate-limit-not-working
docs/update-api-guide
refactor/extract-logging-util
test/api-endpoint-coverage
chore/update-dependencies
```

### Commit Message Format

**Structure:**
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance

**Examples:**
```
feat: add health check endpoint

Added /api/health endpoint that returns server status,
uptime, and timestamp. Useful for monitoring.

fix: correct rate limiter window calculation

The rate limiter was using milliseconds instead of seconds,
causing incorrect timeout calculations.

docs: update security best practices

Added section on Firebase security rules and examples
of proper Firestore query patterns.
```

**Bad Examples:**
```
fixed stuff
update
changes
wip
```

### Pull Request Conventions

**PR Title:** Should match commit message format
```
feat: add user profile caching
```

**PR Description Template:**
```markdown
## Changes
- Added profile caching with 5-minute TTL
- Updated user service to check cache first
- Added cache invalidation on profile update

## Testing
- Manually tested cache hit/miss
- Verified cache clears on logout
- Tested with 100 concurrent requests

## Screenshots (if UI changes)
[Add screenshots here]

## Checklist
- [x] Code follows style guide
- [x] No security vulnerabilities
- [x] Manually tested
- [x] Documentation updated
```

### Before Merging

- [ ] All comments addressed
- [ ] CI passing (build + lint)
- [ ] At least one approval
- [ ] No merge conflicts
- [ ] Branch up to date with main

### After Merging

- Delete feature branch
- Monitor deployment in Railway
- Check error logs for issues
- Notify team in relevant channels

## Performance Benchmarks

Expected response times and resource usage for monitoring performance.

### API Endpoints

**Target Response Times (p95):**
- `GET /api/models` - <100ms (cached model list)
- `POST /api/generate` - <3000ms (depends on AI generation)
- `GET /dashboard` - <200ms (static HTML)
- Health checks - <50ms

**Current Observed:**
```bash
# Check recent generation times
cat backend/logs/combined.log | grep "generationTime" | tail -10

# Typical range: 500ms - 5000ms depending on prompt complexity
```

**Action Thresholds:**
- >5s response - Investigate prompt length or model issues
- >10s response - Consider timeout or switching models
- >30s - Likely API timeout, check Gemini status

### Frontend Performance

**Target Metrics:**
- **First Contentful Paint (FCP):** <1.5s
- **Largest Contentful Paint (LCP):** <2.5s
- **Time to Interactive (TTI):** <3.5s
- **Cumulative Layout Shift (CLS):** <0.1

**Bundle Size Targets:**
- Main JS bundle: <500KB gzipped
- Total JS: <1.5MB gzipped
- CSS: <50KB gzipped

**Measuring:**
```bash
cd frontend
npm run build
du -sh dist/*.js
# Current: ~400KB main bundle

# Use Lighthouse in Chrome DevTools for Core Web Vitals
```

### Database Performance

**Firestore Read Times:**
- Single document: <50ms
- Query (<50 docs): <200ms
- Query (>50 docs): <1000ms

**Write Times:**
- Single document: <100ms
- Batch write (<500): <500ms

**Action Thresholds:**
- >1s reads - Add indexes
- >500ms writes - Reduce document size
- >50 reads/sec - Implement caching

### Memory Usage

**Backend Process:**
- Idle: ~50MB
- Under load: ~150MB
- Maximum acceptable: 512MB

**Frontend (Browser):**
- Initial load: ~30MB
- After heavy use: ~80MB
- Memory leak threshold: >200MB after 10 min

**Monitoring:**
```javascript
// Backend
logger.info('Memory usage', { 
  heapUsed: process.memoryUsage().heapUsed / 1024 / 1024 + 'MB' 
});

// Frontend (browser console)
performance.memory.usedJSHeapSize / 1024 / 1024 + 'MB'
```

### Network Usage

**API Call Sizes:**
- Request payload: <10KB typical
- Response payload: <50KB typical
- Large responses (>100KB): Should be paginated

**Optimization Targets:**
- Reduce API calls with caching
- Compress responses with gzip
- Use pagination for lists
- Lazy load images/audio

### Cost Benchmarks

**Gemini API (pricing as of March 2026, verify current rates):**
- gemini-2.0-flash-exp: ~$0.001 per request (estimate)
- gemini-1.5-pro: ~$0.01 per request (estimate)
- Target: <$50/month for moderate usage
- Check latest pricing: https://ai.google.dev/pricing

**Firebase:**
- Reads: Aim for <50,000/day (free tier)
- Writes: Aim for <20,000/day (free tier)
- Storage: <1GB (free tier)

**Railway Hosting:**
- Free tier: 500 hours/month
- Pay-as-you-go: ~$5-20/month typical

## Cost Optimization

Strategies to minimize API and infrastructure costs.

### Gemini API Cost Reduction

**1. Use Cheaper Models When Appropriate:**
```javascript
// For simple tasks, use flash model
const model = taskComplexity === 'simple' 
  ? 'gemini-1.5-flash'  // Cheaper
  : 'gemini-2.0-flash-exp';  // Current default
```

**2. Implement Response Caching:**
```javascript
// Pseudo-code for caching (not implemented yet)
const cache = new Map();
const cacheKey = hashPrompt(prompt + systemInstruction);

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const response = await generateAI(prompt);
cache.set(cacheKey, response);
```

**3. Limit Prompt Length:**
```javascript
// Current: 5000 char limit in validation
// Consider: 1000 chars for most use cases
const maxLength = 1000;  // Shorter = cheaper
```

**4. Optimize System Instructions:**
```javascript
// ❌ Verbose (more tokens = higher cost)
const systemInstruction = "You are a helpful AI assistant that provides detailed, comprehensive answers with examples and explanations for every point.";

// ✅ Concise (fewer tokens = lower cost)
const systemInstruction = "Be concise and direct.";
```

**5. Batch Requests:**
```javascript
// Instead of multiple calls, combine prompts
const prompts = [prompt1, prompt2, prompt3];
const combined = prompts.join('\n---\n');
// One API call instead of three
```

### Firebase Cost Reduction

**1. Minimize Reads:**
```javascript
// ❌ Reads all posts every time
const posts = await getDocs(collection(db, 'posts'));

// ✅ Use limits and caching
const cachedPosts = localStorage.getItem('posts');
if (cachedPosts && Date.now() - lastFetch < 60000) {
  return JSON.parse(cachedPosts);
}

const q = query(collection(db, 'posts'), limit(20));
const posts = await getDocs(q);
```

**2. Use Realtime Listeners Sparingly:**
```javascript
// ❌ Listener fires on every document change
onSnapshot(collection(db, 'posts'), callback);

// ✅ Fetch once, update manually
const posts = await getDocs(collection(db, 'posts'));
```

**3. Implement Pagination:**
```javascript
// Instead of loading all data
const firstPage = query(collection(db, 'posts'), limit(20));
// Load more on demand
const nextPage = query(collection(db, 'posts'), 
  startAfter(lastDoc), 
  limit(20)
);
```

**4. Denormalize Data:**
```javascript
// ❌ Multiple reads for related data
const user = await getDoc(doc(db, 'users', uid));
const posts = await getDocs(query(collection(db, 'posts'), 
  where('userId', '==', uid)));

// ✅ Store post count in user document (one read)
const user = await getDoc(doc(db, 'users', uid));
// user.postCount available immediately
```

### Railway Hosting Optimization

**1. Reduce Build Times:**
- Cache dependencies in Railway
- Use minimal base images
- Skip unnecessary build steps

**2. Scale Down When Possible:**
- Use Railway's sleep mode for dev environments
- Auto-scale based on traffic
- Monitor and adjust resources

**3. Optimize Cold Starts:**
```javascript
// Keep backend warm with periodic health checks
// (Not implemented yet)
setInterval(() => {
  fetch('https://api-url.railway.app/api/models');
}, 14 * 60 * 1000);  // Every 14 minutes
```

### General Optimization

**1. Enable Compression:**
```javascript
// In backend/server.js (requires: npm install compression)
const compression = require('compression');
app.use(compression());  // Gzip responses
```

**2. Implement CDN for Static Assets:**
- Use Railway CDN or Cloudflare
- Cache frontend dist/ folder
- Reduce bandwidth costs

**3. Monitor Usage:**
```bash
# Track daily costs
echo "$(date): Gemini calls: $(grep '/api/generate' backend/logs/combined.log | wc -l)" >> costs.log
```

**4. Set Budget Alerts:**
- Google Cloud Console: Set Gemini API budget
- Firebase: Set usage alerts
- Railway: Monitor monthly spend

**5. Implement User Quotas:**
```javascript
// Track per-user API usage (not implemented)
const userQuota = {
  free: 10,      // 10 requests/day
  paid: 1000     // 1000 requests/day
};
```

### Cost Monitoring

```bash
# Estimated monthly costs (current setup)
# Gemini API: ~$0-50 (depends on usage)
# Firebase: $0 (within free tier)
# Railway: $5-20 (depends on usage)
# Total: $5-70/month

# Monitor actual usage:
# 1. Google Cloud Console → Billing
# 2. Firebase Console → Usage
# 3. Railway Dashboard → Metrics
```

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
