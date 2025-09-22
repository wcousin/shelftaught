import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authenticate } from './middleware/auth';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import { sanitizeInput, xssProtection } from './middleware/sanitization';
import { 
  requestIdMiddleware, 
  timingMiddleware, 
  requestLoggingMiddleware,
  securityMonitoringMiddleware,
  rateLimitMonitoringMiddleware,
  errorMonitoringMiddleware
} from './middleware/monitoring';
import { responseHelpers } from './utils/response';
import DatabaseService from './services/database';
import { Logger } from './utils/logger';
import Environment from './config/environment';
import authRoutes from './routes/auth';
import curriculaRoutes from './routes/curricula';
import searchRoutes from './routes/search';
import categoriesRoutes from './routes/categories';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import sitemapRoutes from './routes/sitemap';
import healthRoutes from './routes/health';

// Load and validate environment configuration
const config = Environment.getConfig();

const app = express();

// Configure trust proxy for Railway deployment (specific to Railway's infrastructure)
app.set('trust proxy', 1);

// Simple health check (before any middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle preflight OPTIONS requests - remove the problematic wildcard
// The CORS middleware should handle this automatically

// Health check routes
app.use('/', healthRoutes);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration - completely permissive for debugging
app.use(cors({
  origin: '*',
  credentials: false, // Can't use credentials with wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Monitoring middleware (must be early in the chain)
app.use(requestIdMiddleware);
app.use(timingMiddleware);
app.use(securityMonitoringMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(sanitizeInput);
app.use(xssProtection);

// Rate limiting with monitoring
app.use('/api/', apiLimiter);
app.use(rateLimitMonitoringMiddleware);

// Response helpers
app.use(responseHelpers);

// Request logging
app.use(requestLogger);

// Basic API route
app.get('/api', (req, res) => {
  res.success({
    message: 'Shelf Taught API Server',
    version: '1.0.0',
  });
});

// Authentication routes (with stricter rate limiting)
app.use('/api/auth', authLimiter, authRoutes);

// Curriculum routes
app.use('/api/curricula', curriculaRoutes);

// Search routes
app.use('/api/search', searchRoutes);

// Categories routes
app.use('/api/categories', categoriesRoutes);

// User routes (protected)
app.use('/api/user', userRoutes);

// Admin routes (protected)
app.use('/api/admin', adminRoutes);

// SEO routes (sitemap, robots.txt)
app.use('/', sitemapRoutes);

// Health check routes
app.use('/api', healthRoutes);

// Protected route example (for testing authentication)
app.get('/api/protected', authenticate, (req, res) => {
  res.success({
    user: req.user,
  }, 'This is a protected route');
});

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Error monitoring middleware (before global error handler)
app.use(errorMonitoringMiddleware);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  Logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await DatabaseService.disconnect();
    Logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    Logger.error('Error during graceful shutdown', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await DatabaseService.connect();
    
    // Start HTTP server
    const server = app.listen(config.port, '0.0.0.0', () => {
      Logger.info(`🚀 Server running on port ${config.port}`);
      Logger.info(`📊 Health check available at http://0.0.0.0:${config.port}/health`);
      Logger.info(`🔐 API documentation available at http://0.0.0.0:${config.port}/api`);
      Logger.info(`🌍 Environment: ${config.nodeEnv}`);
      Logger.info(`🔧 PORT env var: ${process.env.PORT}`);
      Logger.info(`🔧 Listening on: 0.0.0.0:${config.port}`);
    });
    
    server.on('error', (error) => {
      Logger.error('Server error:', error);
    });
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

// Export app for testing
export { app };
