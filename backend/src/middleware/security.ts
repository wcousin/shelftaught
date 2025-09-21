import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { Logger } from '../utils/logger.js';

// Enhanced security headers middleware
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "https:", "wss:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
    reportOnly: false,
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-XSS-Protection
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: ['strict-origin-when-cross-origin'],
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false,
  },

  // Note: Expect-CT is deprecated, removed from helmet v5+

  // Feature Policy / Permissions Policy
  permittedCrossDomainPolicies: false,
});

// HTTPS redirect middleware
export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
    Logger.security('HTTP request redirected to HTTPS', {
      originalUrl: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    return res.redirect(301, `https://${req.get('Host')}${req.url}`);
  }
  next();
};

// Security headers for API responses
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive API responses
  if (req.path.includes('/api/auth') || req.path.includes('/api/user') || req.path.includes('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  // Add security headers for all API responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

// CORS security middleware
export const corsSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
  const origin = req.get('Origin');

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
};

// Rate limiting headers
export const rateLimitHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add rate limit information to response headers
  res.on('finish', () => {
    const rateLimitInfo = {
      limit: res.get('X-RateLimit-Limit'),
      remaining: res.get('X-RateLimit-Remaining'),
      reset: res.get('X-RateLimit-Reset'),
    };

    if (rateLimitInfo.limit) {
      Logger.debug('Rate limit info', {
        path: req.path,
        ip: req.ip,
        rateLimitInfo,
      });
    }
  });

  next();
};

// Content validation middleware
export const contentValidation = (req: Request, res: Response, next: NextFunction) => {
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded'))) {
      Logger.security('Invalid Content-Type header', {
        contentType,
        method: req.method,
        path: req.path,
        ip: req.ip,
      });
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Invalid Content-Type header',
        },
      });
    }
  }

  // Validate Content-Length
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    Logger.security('Request too large', {
      contentLength,
      path: req.path,
      ip: req.ip,
    });
    
    return res.status(413).json({
      success: false,
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload too large',
      },
    });
  }

  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'development') {
      return next(); // Skip IP filtering in development
    }

    const clientIP = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      Logger.security('IP not whitelisted for admin access', {
        clientIP,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Access denied from this IP address',
        },
      });
    }

    next();
  };
};