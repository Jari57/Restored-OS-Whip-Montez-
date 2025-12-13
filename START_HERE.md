# 🚀 Quick Start Guide - No More Localhost Crashes!

## The Problem
Your localhost keeps crashing because of:
- ❌ Running from wrong directory
- ❌ Port conflicts (Node processes not killed)
- ❌ Missing environment variables
- ❌ Multiple instances running

## The Solution - Easy Commands

### From Root Directory (Always Run These)

```powershell
# 1. Kill all Node processes (fixes port conflicts)
npm run kill

# 2. Start frontend (Vite dev server on port 5173)
npm run dev

# 3. Start backend (in SEPARATE terminal on port 3001)
npm run backend

# 4. Fresh start backend (kills old processes first)
npm run fresh

# 5. Build for production
npm run build

# 6. Install all dependencies
npm run install:all
```

## Recommended Workflow

### Every Day Startup:
```powershell
# Terminal 1 - Backend
cd c:\Users\jari5\whip-montez-live
npm run fresh

# Terminal 2 - Frontend (wait 5 seconds after backend starts)
cd c:\Users\jari5\whip-montez-live
npm run dev
```

### When Localhost Crashes:
```powershell
# Kill everything and restart
npm run kill
# Wait 5 seconds
npm run backend   # Terminal 1
npm run dev       # Terminal 2
```

## URLs
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Dashboard:** http://localhost:3001/dashboard

## Troubleshooting

### "Port 3001 already in use"
```powershell
npm run kill
# Wait 5 seconds
npm run backend
```

### "Port 5173 already in use"
```powershell
npm run kill
# Wait 5 seconds
npm run dev
```

### Backend won't start - Missing API Key
```powershell
# Check if GEMINI_API_KEY exists
cd backend
node check_env.js

# If missing, add to backend/.env:
# GEMINI_API_KEY=your_key_here
```

### Vite keeps restarting
- Too many file changes detected
- Solution: Close other terminals running `npm run dev`
- Or run: `npm run kill` first

## Pro Tips
- ✅ Always use TWO separate terminals (backend + frontend)
- ✅ Start backend FIRST, wait 5 seconds, then start frontend
- ✅ Run `npm run kill` before starting if you had crashes
- ✅ Check backend logs for errors before starting frontend
- ✅ Use `Ctrl+C` to stop servers gracefully (don't just close terminal)

## Emergency Reset
```powershell
# Nuclear option - restart everything clean
npm run kill
timeout /t 5 /nobreak
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm run fresh     # Terminal 1
npm run dev       # Terminal 2
```

---
**Made on:** December 13, 2025  
**Last Updated:** Production hardening complete 🔒
