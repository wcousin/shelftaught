import { Request, Response, NextFunction } from 'express';

/**
 * Custom NoSQL injection prevention middleware
 * Replaces express-mongo-sanitize to avoid compatibility issues with Express 5.x
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Recursively sanitize object to remove NoSQL injection patterns
  const sanitizeObject = (obj: any): any => {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const sanitized: any = {};
      for (const key in obj) {
        // Remove keys that start with $ or contain dots (MongoDB operators)
        if (typeof key === 'string' && (key.startsWith('$') || key.includes('.'))) {
          continue;
        }
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body only (query and params are read-only in Express 5.x)
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeObject(req.body);
    } catch (error) {
      console.warn('Failed to sanitize request body:', error);
    }
  }

  next();
};

/**
 * Custom XSS protection middleware
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Basic XSS protection by escaping HTML characters in string values
  const sanitizeValue = (value: any, key?: string): any => {
    if (typeof value === 'string') {
      // Don't encode slashes in URL fields (imageUrl, etc.)
      const isUrlField = key && (key.toLowerCase().includes('url') || key.toLowerCase().includes('image'));
      
      let sanitized = value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      // Only encode slashes if it's not a URL field
      if (!isUrlField) {
        sanitized = sanitized.replace(/\//g, '&#x2F;');
      }
      
      return sanitized;
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = Array.isArray(value) ? [] : {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key], key);
      }
      return sanitized;
    }
    return value;
  };

  // Only sanitize request body (query and params are read-only in Express 5.x)
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = sanitizeValue(req.body);
    } catch (error) {
      console.warn('Failed to sanitize request body:', error);
    }
  }

  next();
};