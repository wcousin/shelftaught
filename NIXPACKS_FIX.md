# Nixpacks Build Failure Fix

## Issue
Nixpacks build failed with error:
```
error: undefined variable 'npm'
at /app/.nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix:19:21:
```

## Root Cause
The nixpacks.toml configuration had `nixPkgs = ['nodejs-18_x', 'npm']` but `npm` is not a valid nixpkg. In Nix, npm comes bundled with nodejs.

## Solution
Switched back to Docker with a simple, reliable Dockerfile:

### New Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
```

### Updated railway.json:
```json
{
  "build": { "builder": "DOCKERFILE" },
  "deploy": { ... }
}
```

### Updated package.json:
- Added `serve` as a dependency
- Fixed start script to use `serve` directly

## Expected Result
- Railway will use Docker (reliable)
- Build process: `npm ci` → `npm run build` → creates `dist/`
- Start process: `serve -s dist -l $PORT` (serves static React app)
- Frontend should respond at https://frontend-production-aeaaf.up.railway.app

This approach is simpler and more reliable than Nixpacks for static React apps.