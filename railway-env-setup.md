# Railway Environment Variables Setup

## Backend Service Environment Variables

You need to set these environment variables in your Railway backend service:

### Required Variables:

1. **JWT_SECRET** (Critical - backend won't work without this)
   ```
   JWT_SECRET=your-super-secure-jwt-secret-here-make-it-long-and-random-2024
   ```

2. **NODE_ENV**
   ```
   NODE_ENV=production
   ```

3. **JWT_EXPIRES_IN**
   ```
   JWT_EXPIRES_IN=7d
   ```

4. **FRONTEND_URL** (Replace with your actual frontend Railway URL)
   ```
   FRONTEND_URL=https://frontend-production-aeaaf.up.railway.app
   ```

### How to Set These in Railway:

1. Go to your Railway dashboard
2. Click on your backend service
3. Go to the "Variables" tab
4. Click "New Variable" for each one above
5. Enter the variable name and value
6. Click "Deploy" to restart the service

### Generate a Secure JWT_SECRET:

You can use this command to generate a secure random string:
```bash
openssl rand -base64 64
```

Or use this example (but generate your own for security):
```
JWT_SECRET=super-secure-jwt-secret-for-production-2024-shelftaught-app-random-string-here-abcdef123456
```

## After Setting Variables:

1. Railway will automatically redeploy your backend
2. Wait 2-3 minutes for deployment to complete
3. Test the login API:
   ```bash
   curl -X POST https://shelftaught-production.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"wcousin@gmail.com","password":"TestPass@321"}'
   ```

4. You should get a successful response with a JWT token
5. Then login on your frontend with the admin credentials:
   - Email: wcousin@gmail.com
   - Password: TestPass@321

## Expected Success Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "wcousin@gmail.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

Once this works, you'll see "Admin User" and "ADMIN" role in the frontend instead of "Demo User" and "USER".