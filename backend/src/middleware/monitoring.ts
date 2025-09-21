import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

// Extend Request interface to include monitoring data
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Request timing middleware
export const timingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.startTime = Date.now();
  next();
};

// Request logging middleware
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    const responseTime = Date.now() - req.startTime;
    
    // Log the request
    Logger.request(
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime,
      req.requestId
    );

    // Log performance metrics for slow requests
    if (responseTime > 1000) {
      Logger.performance({
        operation: `${req.method} ${req.route?.path || req.path}`,
        duration: responseTime,
        timestamp: new Date().toISOString(),
        details: {
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        },
        requestId: req.requestId,
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Security monitoring middleware
export const securityMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
  ];

  const userAgent = req.get('User-Agent') || '';
  const url = req.originalUrl;
  const body = JSON.stringify(req.body);

  // Check for suspicious patterns
  const suspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body) || pattern.test(userAgent)
  );

  if (suspicious) {
    Logger.security('Suspicious request detected', {
      url,
      method: req.method,
      userAgent,
      body: req.body,
      ip: req.ip,
    }, req.user?.id, req.ip);
  }

  // Monitor failed authentication attempts
  res.on('finish', () => {
    if (req.path.includes('/auth/login') && res.statusCode === 401) {
      Logger.security('Failed login attempt', {
        email: req.body?.email,
        ip: req.ip,
        userAgent,
      }, undefined, req.ip);
    }
  });

  next();
};

// Rate limiting monitoring
export const rateLimitMonitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const rateLimitHeaders = {
    limit: res.get('X-RateLimit-Limit'),
    remaining: res.get('X-RateLimit-Remaining'),
    reset: res.get('X-RateLimit-Reset'),
  };

  if (rateLimitHeaders.remaining && parseInt(rateLimitHeaders.remaining) < 10) {
    Logger.warn('Rate limit approaching', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      rateLimitHeaders,
    });
  }

  next();
};

// Error monitoring middleware
export const errorMonitoringMiddleware = (error: Error, req: Request, res: Response, next: NextFunction) => {
  Logger.errorWithStack(error, {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    body: req.body,
  });

  // Log security-related errors separately
  if (error.name === 'UnauthorizedError' || error.message.includes('token')) {
    Logger.security('Authentication error', {
      error: error.message,
      path: req.path,
      ip: req.ip,
    }, req.user?.id, req.ip);
  }

  next(error);
};

// Health check metrics
interface HealthMetrics {
  uptime: number;
  memory: NodeJS.MemoryUsage;
  cpu: number;
  timestamp: string;
  version: string;
  environment: string;
}

export const getHealthMetrics = (): HealthMetrics => {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage().user / 1000000, // Convert to seconds
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };
};

// Database health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    // This would be implemented with your database client
    // For now, we'll simulate a database check
    const start = Date.now();
    
    // Simulate database query
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const duration = Date.now() - start;
    
    Logger.database('health_check', 'system', duration, true);
    
    return duration < 5000; // Consider healthy if response time < 5s
  } catch (error) {
    Logger.database('health_check', 'system', 0, false, { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  const usage = process.memoryUsage();
  const threshold = 500 * 1024 * 1024; // 500MB threshold

  if (usage.heapUsed > threshold) {
    Logger.warn('High memory usage detected', {
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    });
  }
};

// Start memory monitoring interval
if (process.env.NODE_ENV === 'production') {
  setInterval(monitorMemoryUsage, 60000); // Check every minute
}