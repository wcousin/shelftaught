import { ValidationError } from '../types/errors';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CurriculumRequest {
  name: string;
  publisher: string;
  description: string;
  imageUrl?: string;
  gradeLevelId: string;
  targetAgeGradeRating?: number;
  teachingApproachStyle?: string;
  teachingApproachDescription?: string;
  teachingApproachRating?: number;
  subjectIds?: string[];
  subjectComprehensiveness?: number;
  subjectsCoveredRating?: number;
  materialsComponents?: string[];
  materialsCompleteness?: number;
  materialsIncludedRating?: number;
  instructionStyleType?: string;
  instructionSupportLevel?: number;
  instructionStyleRating?: number;
  timeCommitmentDailyMinutes?: number;
  timeCommitmentWeeklyHours?: number;
  timeCommitmentFlexibility?: number;
  timeCommitmentRating?: number;
  costPriceRange?: string;
  costValue?: number;
  costRating?: number;
  strengths?: string[];
  weaknesses?: string[];
  bestFor?: string[];
  availabilityInPrint?: boolean;
  availabilityDigital?: boolean;
  availabilityUsedMarket?: boolean;
  availabilityRating?: number;
}

export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    // At least 8 characters, contains at least one letter and one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate name (first name or last name)
   */
  static isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }

  /**
   * Validate login request
   */
  static validateLoginRequest(data: any): LoginRequest {
    const errors: string[] = [];

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', { errors });
    }

    return {
      email: data.email.toLowerCase().trim(),
      password: data.password,
    };
  }

  /**
   * Validate registration request
   */
  static validateRegisterRequest(data: any): RegisterRequest {
    const errors: string[] = [];

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    } else if (!this.isValidPassword(data.password)) {
      errors.push('Password must be at least 8 characters long and contain at least one letter and one number');
    }

    if (!data.firstName || typeof data.firstName !== 'string') {
      errors.push('First name is required');
    } else if (!this.isValidName(data.firstName)) {
      errors.push('First name must be between 2 and 50 characters');
    }

    if (!data.lastName || typeof data.lastName !== 'string') {
      errors.push('Last name is required');
    } else if (!this.isValidName(data.lastName)) {
      errors.push('Last name must be between 2 and 50 characters');
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', { errors });
    }

    return {
      email: data.email.toLowerCase().trim(),
      password: data.password,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    };
  }

  /**
   * Validate rating value (1-5 scale)
   */
  static isValidRating(rating: any): boolean {
    return typeof rating === 'number' && rating >= 1 && rating <= 5 && Number.isInteger(rating);
  }

  /**
   * Validate cost price range
   */
  static isValidCostRange(range: string): boolean {
    return ['$', '$$', '$$$'].includes(range);
  }

  /**
   * Validate curriculum creation request
   */
  static validateCurriculumRequest(data: any, isUpdate = false): Partial<CurriculumRequest> {
    const errors: string[] = [];

    // Required fields for creation
    if (!isUpdate) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Name is required');
      }

      if (!data.publisher || typeof data.publisher !== 'string' || data.publisher.trim().length === 0) {
        errors.push('Publisher is required');
      }

      if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
        errors.push('Description is required');
      }

      if (!data.gradeLevelId || typeof data.gradeLevelId !== 'string') {
        errors.push('Grade level ID is required');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', { errors });
    }

    // Return sanitized data
    const result: Partial<CurriculumRequest> = {};
    
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.publisher !== undefined) result.publisher = data.publisher.trim();
    if (data.description !== undefined) result.description = data.description.trim();
    if (data.gradeLevelId !== undefined) result.gradeLevelId = data.gradeLevelId;

    return result;
  }
}