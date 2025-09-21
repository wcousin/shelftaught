# Railway Deployment Fix Guide

## Issues Identified

1. **Frontend 502 Error**: Frontend service not responding
2. **Backend Database Error**: Database connection issues
3. **Build Process Issues**: Inconsistent build configuration

## Step-by-Step Fix

### 1. Frontend Issues

The frontend is failing to start. Here's what to check in Railway:

#### A. Check Railway Frontend Service Configuration

1. Go to your Railway dashboard
2. Select your frontend service
3. Check the **Build Logs** and **Deploy Logs** for errors
4. Verify these settings:
   - **Root Directory**: `/frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `node server.cjs`

#### B. Environment Variables for Frontend

Make sure these are set in Railway frontend service:
```
NODE_ENV=production
```

### 2. Backend Database Issues

The backend is running but can't connect to the database.

#### A. Check Railway Backend Service Configuration

1. Go to your Railway dashboard
2. Select your backend service
3. Verify these settings:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run railway:start`

#### B. Database Service

1. Ensure you have a PostgreSQL database service in your Railway project
2. The `DATABASE_URL` should be automatically provided by Railway
3. Check that the database service is running

#### C. Environment Variables for Backend

Set these in Railway backend service:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://frontend-production-aeaaf.up.railway.app
PORT=3001
```

### 3. Quick Test Commands

Run these to verify the fixes:

```bash
# Test backend API
curl https://shelftaught-production.up.railway.app/api

# Test backend health
curl https://shelftaught-production.up.railway.app/health

# Test frontend (after fixes)
curl https://frontend-production-aeaaf.up.railway.app/health
```

### 4. Update Frontend API Configuration

The frontend needs to point to the correct backend URL. Update this:

```bash
# Update the frontend environment
echo 'VITE_API_URL=https://shelftaught-production.up.railway.app/api' > frontend/.env.production
```

### 5. Redeploy Services

After making these changes:

1. **Redeploy Backend**: 
   - Go to Railway dashboard → Backend service → Deploy tab → Redeploy
   
2. **Redeploy Frontend**:
   - Go to Railway dashboard → Frontend service → Deploy tab → Redeploy

### 6. Monitor Logs

Watch the deployment logs in Railway dashboard:
- Check for build errors
- Check for runtime errors
- Verify database connection messages

## Expected Results

After fixes:
- Frontend: `https://frontend-production-aeaaf.up.railway.app/` should load
- Backend API: `https://shelftaught-production.up.railway.app/api` should respond
- Database: Backend should connect successfully

## Common Issues & Solutions

### Frontend Still 502?
- Check if the build is creating the `dist` folder
- Verify `node server.cjs` can run locally
- Check Railway logs for specific error messages

### Backend Database Still Failing?
- Verify DATABASE_URL is set by Railway
- Check if database service is running
- Try running migrations manually: `npx prisma migrate deploy`

### CORS Issues?
- Update CORS_ORIGIN to match your frontend URL
- Ensure both services are using HTTPS

## Manual Deployment Commands

If Railway auto-deployment isn't working, you can try manual deployment:

```bash
# For frontend
cd frontend
npm ci
npm run build
node server.cjs

# For backend  
cd backend
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy
npm start
```