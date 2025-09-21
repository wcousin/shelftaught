import { Router, Request, Response } from 'express';
import { AuthUtils } from '../utils/auth';
import { ValidationUtils } from '../utils/validation';
import { AuthenticationError, ConflictError } from '../types/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import DatabaseService from '../services/database';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = ValidationUtils.validateRegisterRequest(req.body);
  const prisma = DatabaseService.getInstance();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await AuthUtils.hashPassword(validatedData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = AuthUtils.generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  res.created({
    user,
    token,
  }, 'User registered successfully');
}));

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const validatedData = ValidationUtils.validateLoginRequest(req.body);
  const prisma = DatabaseService.getInstance();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await AuthUtils.comparePassword(validatedData.password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Generate JWT token
  const token = AuthUtils.generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user data (excluding password) and token
  const { password, ...userWithoutPassword } = user;

  res.success({
    user: userWithoutPassword,
    token,
  }, 'Login successful');
}));

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {

  const prisma = DatabaseService.getInstance();
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AuthenticationError('User not found');
  }

  res.success({ user });
}));

export default router;