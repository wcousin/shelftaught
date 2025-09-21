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

// CORS configuration
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

// Request logging (enhanced with monitoring)
app.use(requestLogger);
app.use(requestLoggingMiddleware);

// Health check routes
app.use('/', healthRoutes);

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
    app.listen(config.port, () => {
      Logger.info(`🚀 Server running on port ${config.port}`);
      Logger.info(`📊 Health check available at http://localhost:${config.port}/health`);
      Logger.info(`🔐 API documentation available at http://localhost:${config.port}/api`);
      Logger.info(`🌍 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

// Export app for testing
export { app };
