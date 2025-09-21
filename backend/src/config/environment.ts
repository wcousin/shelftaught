import { Logger } from '../utils/logger';

export interface EnvironmentConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  frontendUrl: string;
}

class Environment {
  private static config: EnvironmentConfig;

  public static getConfig(): EnvironmentConfig {
    if (!Environment.config) {
      Environment.config = Environment.loadConfig();
    }
    return Environment.config;
  }

  private static loadConfig(): EnvironmentConfig {
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
    const missingVars: string[] = [];

    // Check for required environment variables
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Validate JWT secret strength in production
    if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'fallback-secret-key') {
      const errorMessage = 'JWT_SECRET must be changed from default value in production';
      Logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      port: parseInt(process.env.PORT || '3001', 10),
      nodeEnv: process.env.NODE_ENV || 'development',
      databaseUrl: process.env.DATABASE_URL!,
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    };
  }

  public static isDevelopment(): boolean {
    return Environment.getConfig().nodeEnv === 'development';
  }

  public static isProduction(): boolean {
    return Environment.getConfig().nodeEnv === 'production';
  }

  public static isTest(): boolean {
    return Environment.getConfig().nodeEnv === 'test';
  }
}

export default Environment;