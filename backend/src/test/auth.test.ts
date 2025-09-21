import { AuthUtils } from '../utils/auth';
import { ValidationUtils } from '../utils/validation';
import { ValidationError } from '../types/errors';

describe('Authentication Utils', () => {
  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testpassword123';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      const isMatch = await AuthUtils.comparePassword(password, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await AuthUtils.hashPassword(password);
      
      const isMatch = await AuthUtils.comparePassword(wrongPassword, hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'USER',
      };

      const token = AuthUtils.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const payload = {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'USER',
      };

      const token = AuthUtils.generateToken(payload);
      const decoded = AuthUtils.verifyToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        AuthUtils.verifyToken('invalid-token');
      }).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'valid-jwt-token';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = AuthUtils.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });

    it('should throw error for missing header', () => {
      expect(() => {
        AuthUtils.extractTokenFromHeader(undefined);
      }).toThrow();
    });

    it('should throw error for invalid header format', () => {
      expect(() => {
        AuthUtils.extractTokenFromHeader('InvalidFormat token');
      }).toThrow();
    });
  });
});

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(ValidationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(ValidationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(ValidationUtils.isValidEmail('invalid-email')).toBe(false);
      expect(ValidationUtils.isValidEmail('test@')).toBe(false);
      expect(ValidationUtils.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('should return true for valid passwords', () => {
      expect(ValidationUtils.isValidPassword('password123')).toBe(true);
      expect(ValidationUtils.isValidPassword('MySecure1Pass')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(ValidationUtils.isValidPassword('123')).toBe(false); // Too short
      expect(ValidationUtils.isValidPassword('password')).toBe(false); // No numbers
      expect(ValidationUtils.isValidPassword('12345678')).toBe(false); // No letters
    });
  });

  describe('validateLoginRequest', () => {
    it('should validate correct login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = ValidationUtils.validateLoginRequest(data);
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should throw ValidationError for invalid data', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };

      expect(() => {
        ValidationUtils.validateLoginRequest(data);
      }).toThrow(ValidationError);
    });
  });

  describe('validateRegisterRequest', () => {
    it('should validate correct registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = ValidationUtils.validateRegisterRequest(data);
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
    });

    it('should throw ValidationError for invalid data', () => {
      const data = {
        email: 'invalid-email',
        password: '123', // Too weak
        firstName: 'J', // Too short
        lastName: 'Doe',
      };

      expect(() => {
        ValidationUtils.validateRegisterRequest(data);
      }).toThrow(ValidationError);
    });
  });
});