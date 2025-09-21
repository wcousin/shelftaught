# Railway Deployment Guide

## Prerequisites
- Railway account with subscription
- GitHub repository
- Domain: shelftaught.com

## Deployment Steps

### 1. Backend Deployment

1. **Create New Project in Railway**
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Add PostgreSQL Database**
   - In your Railway project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically create DATABASE_URL

3. **Configure Backend Service**
   - Add a new service for backend
   - Set root directory to `/backend`
   - Set build command: `npm run build`
   - Set start command: `npm run railway:start`

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secure-jwt-secret-here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://shelftaught.com
   PORT=3001
   ```

### 2. Frontend Deployment

1. **Add Frontend Service**
   - Add another service for frontend
   - Set root directory to `/frontend`
   - Set build command: `npm run build`
   - Railway will auto-detect Vite and serve static files

2. **Update API Base URL**
   - Frontend will need to point to your Railway backend URL
   - Update `frontend/src/services/api.ts` with your backend Railway URL

### 3. Domain Configuration

1. **Backend Domain**
   - In Railway backend service settings
   - Add custom domain: `api.shelftaught.com`
   - Railway will provide SSL certificate

2. **Frontend Domain**
   - In Railway frontend service settings
   - Add custom domain: `shelftaught.com`
   - Railway will provide SSL certificate

3. **DNS Configuration**
   - Point `shelftaught.com` to Railway frontend
   - Point `api.shelftaught.com` to Railway backend
   - Add CNAME records as provided by Railway

### 4. Database Setup

The backend will automatically:
- Run Prisma migrations
- Generate Prisma client
- Seed database with initial data including your admin user

### 5. Admin Access

Once deployed, you can login with:
- **Email:** wcousin@gmail.com
- **Password:** TestPass@321
- **Role:** ADMIN

### 6. Testing

1. Visit `https://shelftaught.com`
2. Test user registration and login
3. Login as admin to access admin panel
4. Test curriculum browsing and search

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=<automatically provided by Railway>
NODE_ENV=production
JWT_SECRET=<generate secure random string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://shelftaught.com
PORT=3001
```

### Frontend
Update `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = 'https://api.shelftaught.com';
```

## Post-Deployment

1. **Monitor logs** in Railway dashboard
2. **Test all functionality** including admin features
3. **Set up monitoring** and alerts
4. **Configure backups** for PostgreSQL database

## Troubleshooting

- Check Railway logs for deployment issues
- Ensure all environment variables are set
- Verify domain DNS configuration
- Test database connectivity

Your app will be live at:
- **Frontend:** https://shelftaught.com
- **Backend API:** https://api.shelftaught.com
- **Admin Panel:** https://shelftaught.com/admin