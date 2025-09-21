import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthenticationError } from '../types/errors';
import Environment from '../config/environment';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthUtils {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generate a JWT token
   */
  static generateToken(payload: JwtPayload): string {
    const config = Environment.getConfig();
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
      issuer: 'shelf-taught-api',
      audience: 'shelf-taught-client',
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const config = Environment.getConfig();
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'shelf-taught-api',
        audience: 'shelf-taught-client',
      }) as JwtPayload;
      
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader) {
      throw new AuthenticationError('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthenticationError('Invalid authorization header format');
    }

    return parts[1];
  }
}