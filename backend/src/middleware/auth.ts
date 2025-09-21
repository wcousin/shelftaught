import { Request, Response, NextFunction } from 'express';
import { AuthUtils, JwtPayload } from '../utils/auth';
import { AuthenticationError, AuthorizationError } from '../types/errors';
import DatabaseService from '../services/database';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    const decoded = AuthUtils.verifyToken(token);

    // Verify user still exists in database
    const prisma = DatabaseService.getInstance();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.role !== 'ADMIN') {
    throw new AuthorizationError('Admin access required');
  }

  next();
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }

    const token = AuthUtils.extractTokenFromHeader(authHeader);
    const decoded = AuthUtils.verifyToken(token);

    // Verify user still exists in database
    const prisma = DatabaseService.getInstance();
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (user) {
      req.user = {
        id: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next();
  }
};