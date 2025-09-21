# Debug Authentication Issues

## Current Status:
- ✅ JWT_SECRET is set correctly
- ✅ Backend server is running (health endpoint works)
- ❌ Authentication endpoint returns 500 error
- ❌ Frontend falls back to mock authentication

## Possible Issues:

### 1. Database Seeding Issue
The admin user might not have been created in the Railway database. The seed script runs during deployment, but it might have failed.

### 2. Password Hashing Issue
There might be an issue with bcrypt password comparison.

### 3. Database Connection Issue
The Prisma client might not be connecting properly to the Railway PostgreSQL database.

## Debug Steps:

### Test 1: Check if basic API works
```bash
curl https://shelftaught-production.up.railway.app/api
```

### Test 2: Check if database connection works
```bash
curl https://shelftaught-production.up.railway.app/api/curricula
```

### Test 3: Try login with different credentials
```bash
curl -X POST https://shelftaught-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## Potential Solutions:

### Solution 1: Re-run Database Seed
The admin user might not exist. We need to manually run the seed script on Railway.

### Solution 2: Check Railway Logs
Look at the Railway backend service logs to see the exact error message.

### Solution 3: Temporarily Disable Authentication
Create a temporary endpoint to check if the user exists in the database.

## Quick Fix: Create Admin User Manually

If the seeding failed, we can create a simple endpoint to manually create the admin user:

```typescript
// Add this to backend/src/index.ts temporarily
app.post('/create-admin', async (req, res) => {
  try {
    const prisma = DatabaseService.getInstance();
    const hashedPassword = await AuthUtils.hashPassword('TestPass@321');
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'wcousin@gmail.com' },
      update: {},
      create: {
        email: 'wcousin@gmail.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    res.json({ success: true, user: adminUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then call:
```bash
curl -X POST https://shelftaught-production.up.railway.app/create-admin
```