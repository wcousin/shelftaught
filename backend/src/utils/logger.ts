import fs from 'fs';
import path from 'path';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  environment: string;
  requestId?: string;
  userId?: string;
  context?: any;
}

export interface AuditLogEntry {
  action: string;
  userId?: string;
  resourceId?: string;
  resourceType?: string;
  details?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PerformanceLogEntry {
  operation: string;
  duration: number;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class Logger {
  private static logsDir = path.join(process.cwd(), 'logs');
  private static isProduction = process.env.NODE_ENV === 'production';

  static {
    // Ensure logs directory exists
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private static formatMessage(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: 'shelftaught-backend',
      environment: process.env.NODE_ENV || 'development',
      context,
    };
  }

  private static writeToFile(filename: string, data: any): void {
    if (this.isProduction) {
      const logPath = path.join(this.logsDir, filename);
      const logString = JSON.stringify(data) + '\n';
      
      try {
        fs.appendFileSync(logPath, logString);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  private static log(entry: LogEntry): void {
    const logString = JSON.stringify(entry, null, this.isProduction ? 0 : 2);
    
    // Console output
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logString);
        this.writeToFile('error.log', entry);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        this.writeToFile('combined.log', entry);
        break;
      case LogLevel.INFO:
        console.info(logString);
        this.writeToFile('combined.log', entry);
        break;
      case LogLevel.DEBUG:
        if (!this.isProduction) {
          console.debug(logString);
        }
        this.writeToFile('debug.log', entry);
        break;
    }

    // Always write to combined log in production
    if (this.isProduction) {
      this.writeToFile('combined.log', entry);
    }
  }

  static error(message: string, context?: any): void {
    this.log(this.formatMessage(LogLevel.ERROR, message, context));
  }

  static warn(message: string, context?: any): void {
    this.log(this.formatMessage(LogLevel.WARN, message, context));
  }

  static info(message: string, context?: any): void {
    this.log(this.formatMessage(LogLevel.INFO, message, context));
  }

  static debug(message: string, context?: any): void {
    this.log(this.formatMessage(LogLevel.DEBUG, message, context));
  }

  static request(method: string, url: string, statusCode: number, responseTime: number, requestId?: string): void {
    const entry = this.formatMessage(LogLevel.INFO, 'HTTP Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
    });
    
    if (requestId) {
      entry.requestId = requestId;
    }
    
    this.log(entry);
  }

  // Audit logging for security and compliance
  static audit(auditEntry: AuditLogEntry): void {
    const entry = {
      ...auditEntry,
      timestamp: new Date().toISOString(),
      service: 'shelftaught-audit',
      environment: process.env.NODE_ENV || 'development',
    };

    const logString = JSON.stringify(entry);
    console.info(`[AUDIT] ${logString}`);
    
    if (this.isProduction) {
      this.writeToFile('audit.log', entry);
    }
  }

  // Performance logging
  static performance(perfEntry: PerformanceLogEntry): void {
    const entry = {
      ...perfEntry,
      timestamp: new Date().toISOString(),
      service: 'shelftaught-performance',
      environment: process.env.NODE_ENV || 'development',
    };

    if (perfEntry.duration > 1000) { // Log slow operations
      console.warn(`[PERFORMANCE] Slow operation: ${JSON.stringify(entry)}`);
    } else if (!this.isProduction) {
      console.debug(`[PERFORMANCE] ${JSON.stringify(entry)}`);
    }
    
    if (this.isProduction) {
      this.writeToFile('performance.log', entry);
    }
  }

  // Security event logging
  static security(event: string, details?: any, userId?: string, ipAddress?: string): void {
    const entry = {
      event,
      details,
      userId,
      ipAddress,
      timestamp: new Date().toISOString(),
      service: 'shelftaught-security',
      environment: process.env.NODE_ENV || 'development',
    };

    console.warn(`[SECURITY] ${JSON.stringify(entry)}`);
    
    if (this.isProduction) {
      this.writeToFile('security.log', entry);
    }
  }

  // Error with stack trace
  static errorWithStack(error: Error, context?: any): void {
    this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  // Structured logging for database operations
  static database(operation: string, table: string, duration: number, success: boolean, details?: any): void {
    this.info('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      details,
    });
  }
}