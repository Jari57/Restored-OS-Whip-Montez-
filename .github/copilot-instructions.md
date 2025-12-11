# Repo guidance for AI coding agents

This repository is a two-part app: a Node/Express backend that proxies Google Gemini (Gemini SDK) and a React/Vite frontend using Firebase. Use these notes to make productive, low-risk code changes.

## Quick architecture (big picture)
- **Backend:** `backend/server.js` — Express API that reads `backend/.env` for `GEMINI_API_KEY`, initializes `GoogleGenerativeAI`, and exposes `POST /api/generate` which returns JSON `{ output: string }`.
- **Frontend:** `frontend/src/App.jsx` — single-file React app (many UI sections) that uses Firebase for auth/firestore and calls the backend via `callGemini()` to generate text. `BACKEND_URL` is toggled by `isLocal` (localhost:3001) or production placeholder.
- **Integration flow:** Frontend -> POST `/api/generate` -> Backend uses `@google/generative-ai` -> responds `{ output }`. Firebase is used locally for state/auth (keys are bundled in `App.jsx`).

## How to run / developer workflows
- Start backend (ensure `backend/.env` contains `GEMINI_API_KEY`):

```powershell
cd backend
# install if needed
npm install
node server.js
```

- Start frontend (Vite):

```powershell
cd frontend
npm install
npm run dev
```

- Debug tips:
  - Backend logs API key loading and will print a substring of the key or an explicit missing-key error.
  - Frontend logs attempts to contact the backend (see `callGemini()` in `frontend/src/App.jsx`) and returns clear strings on failure: `ERROR: BACKEND OFFLINE...` or `CONNECTION ERROR: BACKEND UNREACHABLE.`

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
- The frontend bundles Firebase config directly inside `frontend/src/App.jsx` — do not assume an external config file or env var for Firebase.
- `isLocal` in `App.jsx` detects `window.location.hostname` and switches `BACKEND_URL` to `http://localhost:3001/api/generate`. When changing endpoints update that constant.
- The backend intentionally resolves `.env` with `path.resolve(__dirname, '.env')` in `server.js`; place API key in `backend/.env` (not the repo root `.env`).
 - The backend `package.json` includes a `start` script (`npm start` -> `node server.js`). The project uses CommonJS (`"type":"commonjs"`).

## CI (example)
- A lightweight GitHub Actions workflow was added at `.github/workflows/node-ci.yml` that:
  - checks out the repo, sets up Node 18
  - installs frontend deps and runs `npm run build` in `frontend/`
  - installs backend deps (does not run the server)
  - This keeps CI safe from requiring `GEMINI_API_KEY` or running external services.

Example: the workflow's path is `.github/workflows/node-ci.yml` and it intentionally avoids running `node server.js`.

## Env check helper
- A helper script `backend/check_env.js` was added to print whether `GEMINI_API_KEY` is present in `backend/.env` or the environment. It intentionally hides the value and exits `0` so CI doesn't fail when secrets are absent.
- CI runs this script as an informational step (`.github/workflows/node-ci.yml`) so maintainers can see if the key is configured locally/CI without exposing secrets.

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
- `backend/server.js` — model selection (currently `gemini-1.5-flash`), SDK initialization, error handling, and `.env` loading.
- `frontend/src/App.jsx` — UI, `callGemini()` wrapper, `BACKEND_URL`, Firebase init, and sample usage of generation results (e.g., `Ghostwriter`, `AROffice`).
- `frontend/package.json` and `vite.config.js` — dev scripts and build behavior.

## External integrations & risks
- Uses `@google/generative-ai` in the backend; changes to model or SDK usage must be made in `backend/server.js` and tested locally with a valid `GEMINI_API_KEY`.
- Uses Firebase (auth + Firestore) directly in the frontend. Keys are present in source — avoid committing alternative secret keys. Treat the Firebase project as live.
- Frontend contains a simple wallet/META mask integration for a mock minting flow (`PressingPlant`) — this is a UI stub and not production-ready.

## What the AI agent should not do
- Do not commit new secrets or leak full API keys in source. The backend logs only an 8-character substring of the key by design.
- Avoid changing Firebase config unless instructed — it's intentionally hard-coded in `App.jsx`.

## Small actionable examples for changes
- To change the model: edit `model: "gemini-1.5-flash"` in `backend/server.js`.
- To change backend URL used by the frontend, update `BACKEND_URL` in `frontend/src/App.jsx` or wire it to env vars.

If anything looks incomplete or you'd like more examples (unit tests, CI, or a start script), tell me which area to expand and I will iterate.
