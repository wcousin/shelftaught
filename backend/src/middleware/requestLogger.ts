import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - startTime;
    
    Logger.request(
      req.method,
      req.originalUrl,
      res.statusCode,
      responseTime
    );

    return originalEnd(chunk, encoding, cb);
  };

  next();
};