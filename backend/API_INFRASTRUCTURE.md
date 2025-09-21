# Backend API Infrastructure

This document describes the core backend API infrastructure that has been implemented for the Shelf Taught homeschool curriculum review website.

## Overview

The backend is built with Node.js, Express.js, TypeScript, and PostgreSQL with Prisma ORM. It provides a robust foundation for authentication, error handling, logging, and database operations.

## Architecture Components

### 1. Express Server Setup (`src/index.ts`)
- **Security**: Helmet middleware for security headers
- **CORS**: Configured for frontend communication
- **Body Parsing**: JSON and URL-encoded data support
- **Request Logging**: Custom request logging middleware
- **Graceful Shutdown**: Proper cleanup on process termination

### 2. Database Service (`src/services/database.ts`)
- **Singleton Pattern**: Single Prisma client instance
- **Connection Management**: Connect, disconnect, and health check methods
- **Error Handling**: Proper error logging and propagation
- **Development Logging**: Query logging in development mode

### 3. Authentication System

#### JWT Utilities (`src/utils/auth.ts`)
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Generation**: JWT with configurable expiration
- **Token Verification**: Secure token validation
- **Header Parsing**: Bearer token extraction

#### Authentication Middleware (`src/middleware/auth.ts`)
- **JWT Authentication**: Verify and decode tokens
- **User Validation**: Check user existence in database
- **Role-based Access**: Admin role checking
- **Optional Authentication**: For public/private hybrid routes

#### Validation (`src/utils/validation.ts`)
- **Email Validation**: RFC-compliant email format checking
- **Password Strength**: Minimum 8 chars with letters and numbers
- **Input Sanitization**: Trim and normalize user inputs
- **Request Validation**: Login and registration data validation

### 4. Error Handling System

#### Custom Error Types (`src/types/errors.ts`)
- **AppError**: Base application error class
- **ValidationError**: Input validation failures
- **AuthenticationError**: Authentication failures
- **AuthorizationError**: Permission denied errors
- **NotFoundError**: Resource not found errors
- **ConflictError**: Resource conflict errors

#### Error Middleware (`src/middleware/errorHandler.ts`)
- **Global Error Handler**: Centralized error processing
- **Prisma Error Mapping**: Database error translation
- **JWT Error Handling**: Token-specific error responses
- **Development vs Production**: Different error details based on environment
- **Async Error Wrapper**: Automatic async error catching

### 5. Logging System (`src/utils/logger.ts`)
- **Structured Logging**: JSON-formatted log entries
- **Log Levels**: Error, warn, info, debug levels
- **Request Logging**: HTTP request/response logging
- **Environment-aware**: Different logging in development vs production

### 6. Authentication Routes (`src/routes/auth.ts`)

#### POST /api/auth/register
- User registration with validation
- Password hashing
- JWT token generation
- Duplicate email checking

#### POST /api/auth/login
- User authentication
- Password verification
- JWT token generation
- Secure user data response

#### GET /api/auth/me
- Current user information
- Token-based authentication required
- User existence validation

## API Endpoints

### Public Endpoints
```
GET /health          - Health check with database status
GET /api            - API information and version
POST /api/auth/login     - User authentication
POST /api/auth/register  - User registration
```

### Protected Endpoints
```
GET /api/auth/me    - Current user information
GET /api/protected  - Test protected route
```

## Error Response Format

All errors follow a consistent format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional details (development only)"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

1. **Helmet**: Security headers (CSP, XSS protection, etc.)
2. **CORS**: Configured for specific origins
3. **JWT**: Secure token-based authentication
4. **Password Hashing**: bcrypt with high salt rounds
5. **Input Validation**: Comprehensive request validation
6. **Rate Limiting**: Ready for implementation
7. **Error Sanitization**: No sensitive data in error responses

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Testing

The infrastructure includes comprehensive tests:
- **Unit Tests**: Authentication utilities and validation
- **Integration Tests**: Server middleware and routes
- **Error Handling Tests**: Error scenarios and responses
- **Security Tests**: CORS and security headers

Run tests with:
```bash
npm test
```

## Next Steps

This infrastructure provides the foundation for:
1. Curriculum data API endpoints
2. User account management
3. Admin panel functionality
4. Search and filtering capabilities
5. File upload handling
6. Caching and performance optimization

The authentication system is ready to protect routes, and the error handling system will provide consistent responses across all endpoints.