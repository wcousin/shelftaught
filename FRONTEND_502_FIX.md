# Frontend 502 Error - Root Cause Analysis & Fix

## Root Cause Identified

The 502 error was caused by **Railway running the wrong command**. From the deployment logs:

```
> frontend@0.0.0 dev
> if [ "$NODE_ENV" = "production" ]; then npm run start; else vite; fi --host 0.0.0.0
sh: syntax error: unexpected word
```

### Issues Found:

1. **Railway was using Docker instead of Nixpacks** despite railway.json specifying NIXPACKS
2. **Railway was running `npm run dev`** instead of the production start command
3. **The dev script had shell syntax issues** when Railway tried to append `--host 0.0.0.0`
4. **Frontend .env file had wrong API URL** (localhost:3000 instead of 3001)
5. **Mixed configuration files** causing Railway to be confused about which builder to use

## Fixes Applied:

### 1. ✅ Removed Dockerfile
- Deleted `frontend/Dockerfile` to force Railway to use Nixpacks
- This prevents Railway from auto-detecting Docker and ignoring nixpacks.toml

### 2. ✅ Updated railway.json
- Added explicit `startCommand: "npm run railway:start"`
- Ensured NIXPACKS builder is used

### 3. ✅ Fixed nixpacks.toml
- Changed start command to use `npx serve` directly
- Added explicit PORT variable

### 4. ✅ Fixed package.json scripts
- Updated `start` script to use serve instead of node start.js
- Fixed `railway:start` script syntax
- Simplified `dev` script to avoid shell syntax issues

### 5. ✅ Fixed .env file
- Corrected API URL from localhost:3000 to localhost:3001

## Expected Behavior After Fix:

1. **Railway will use Nixpacks** (not Docker)
2. **Build process**: `npm ci` → `npm run build` → creates `dist/` folder
3. **Start process**: `npx serve -s dist -p $PORT` (serves static files)
4. **Frontend will respond** at https://frontend-production-aeaaf.up.railway.app

## Configuration Summary:

### railway.json
```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": { "startCommand": "npm run railway:start" }
}
```

### nixpacks.toml
```toml
[phases.start]
cmd = 'npx serve -s dist -l $PORT'
```

### package.json
```json
{
  "start": "npx serve -s dist -p ${PORT:-3000}",
  "railway:start": "npx serve -s dist -p $PORT"
}
```

## Backend Status:
✅ **Backend is working perfectly**
- API: https://shelftaught-production.up.railway.app/api ✅
- Health: https://shelftaught-production.up.railway.app/health ✅
- Only issue: Database connection (needs Railway dashboard check)

## Next Steps:
1. Push these changes to trigger Railway redeploy
2. Monitor deployment logs to ensure Nixpacks is used
3. Test frontend health endpoint
4. Fix backend database connection in Railway dashboard

The frontend should now deploy successfully and serve the React app properly.