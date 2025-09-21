import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseUtils {
  /**
   * Send a successful response
   */
  static success<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    pagination?: ApiResponse['pagination']
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      ...(pagination && { pagination }),
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send a created response (201)
   */
  static created<T>(res: Response, data?: T, message?: string): void {
    ResponseUtils.success(res, data, message, 201);
  }

  /**
   * Send a no content response (204)
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send a paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): void {
    const totalPages = Math.ceil(total / limit);
    
    ResponseUtils.success(res, data, message, 200, {
      page,
      limit,
      total,
      totalPages,
    });
  }
}

// Extend Express Response interface
declare global {
  namespace Express {
    interface Response {
      success<T>(data?: T, message?: string, statusCode?: number): void;
      created<T>(data?: T, message?: string): void;
      paginated<T>(data: T[], page: number, limit: number, total: number, message?: string): void;
    }
  }
}

/**
 * Middleware to add response helper methods to Express Response object
 */
export const responseHelpers = (req: any, res: Response, next: any): void => {
  res.success = function<T>(data?: T, message?: string, statusCode?: number) {
    ResponseUtils.success(this, data, message, statusCode);
  };

  res.created = function<T>(data?: T, message?: string) {
    ResponseUtils.created(this, data, message);
  };

  res.paginated = function<T>(data: T[], page: number, limit: number, total: number, message?: string) {
    ResponseUtils.paginated(this, data, page, limit, total, message);
  };

  next();
};