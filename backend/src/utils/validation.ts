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
    return ['$', '$$', '$$$', '$$$$'].includes(range);
  }

  /**
   * Validate rating value (0-5 scale, allowing decimals)
   */
  static isValidDecimalRating(rating: any): boolean {
    return typeof rating === 'number' && rating >= 0 && rating <= 5;
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

    // Validate optional numeric fields
    if (data.targetAgeGradeRating !== undefined && (typeof data.targetAgeGradeRating !== 'number' || data.targetAgeGradeRating < 0 || data.targetAgeGradeRating > 5)) {
      errors.push('Target age grade rating must be a number between 0 and 5');
    }

    if (data.teachingApproachRating !== undefined && (typeof data.teachingApproachRating !== 'number' || data.teachingApproachRating < 0 || data.teachingApproachRating > 5)) {
      errors.push('Teaching approach rating must be a number between 0 and 5');
    }

    if (data.subjectsCoveredRating !== undefined && (typeof data.subjectsCoveredRating !== 'number' || data.subjectsCoveredRating < 0 || data.subjectsCoveredRating > 5)) {
      errors.push('Subjects covered rating must be a number between 0 and 5');
    }

    if (data.materialsIncludedRating !== undefined && (typeof data.materialsIncludedRating !== 'number' || data.materialsIncludedRating < 0 || data.materialsIncludedRating > 5)) {
      errors.push('Materials included rating must be a number between 0 and 5');
    }

    if (data.instructionStyleRating !== undefined && (typeof data.instructionStyleRating !== 'number' || data.instructionStyleRating < 0 || data.instructionStyleRating > 5)) {
      errors.push('Instruction style rating must be a number between 0 and 5');
    }

    if (data.timeCommitmentRating !== undefined && (typeof data.timeCommitmentRating !== 'number' || data.timeCommitmentRating < 0 || data.timeCommitmentRating > 5)) {
      errors.push('Time commitment rating must be a number between 0 and 5');
    }

    if (data.costRating !== undefined && (typeof data.costRating !== 'number' || data.costRating < 0 || data.costRating > 5)) {
      errors.push('Cost rating must be a number between 0 and 5');
    }

    if (data.availabilityRating !== undefined && (typeof data.availabilityRating !== 'number' || data.availabilityRating < 0 || data.availabilityRating > 5)) {
      errors.push('Availability rating must be a number between 0 and 5');
    }

    // Validate arrays
    if (data.subjectIds !== undefined && !Array.isArray(data.subjectIds)) {
      errors.push('Subject IDs must be an array');
    }

    if (data.materialsComponents !== undefined && !Array.isArray(data.materialsComponents)) {
      errors.push('Materials components must be an array');
    }

    if (data.strengths !== undefined && !Array.isArray(data.strengths)) {
      errors.push('Strengths must be an array');
    }

    if (data.weaknesses !== undefined && !Array.isArray(data.weaknesses)) {
      errors.push('Weaknesses must be an array');
    }

    if (data.bestFor !== undefined && !Array.isArray(data.bestFor)) {
      errors.push('Best for must be an array');
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', { errors });
    }

    // Return sanitized data with all fields
    const result: Partial<CurriculumRequest> = {};
    
    // Basic fields
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.publisher !== undefined) result.publisher = data.publisher.trim();
    if (data.description !== undefined) result.description = data.description.trim();
    if (data.imageUrl !== undefined) result.imageUrl = data.imageUrl.trim();
    if (data.gradeLevelId !== undefined) result.gradeLevelId = data.gradeLevelId;

    // Rating fields
    if (data.targetAgeGradeRating !== undefined) result.targetAgeGradeRating = data.targetAgeGradeRating;
    if (data.teachingApproachRating !== undefined) result.teachingApproachRating = data.teachingApproachRating;
    if (data.subjectsCoveredRating !== undefined) result.subjectsCoveredRating = data.subjectsCoveredRating;
    if (data.materialsIncludedRating !== undefined) result.materialsIncludedRating = data.materialsIncludedRating;
    if (data.instructionStyleRating !== undefined) result.instructionStyleRating = data.instructionStyleRating;
    if (data.timeCommitmentRating !== undefined) result.timeCommitmentRating = data.timeCommitmentRating;
    if (data.costRating !== undefined) result.costRating = data.costRating;
    if (data.availabilityRating !== undefined) result.availabilityRating = data.availabilityRating;

    // Text fields
    if (data.teachingApproachStyle !== undefined) result.teachingApproachStyle = data.teachingApproachStyle;
    if (data.teachingApproachDescription !== undefined) result.teachingApproachDescription = data.teachingApproachDescription;
    if (data.instructionStyleType !== undefined) result.instructionStyleType = data.instructionStyleType;
    if (data.costPriceRange !== undefined) result.costPriceRange = data.costPriceRange;

    // Numeric fields
    if (data.subjectComprehensiveness !== undefined) result.subjectComprehensiveness = data.subjectComprehensiveness;
    if (data.materialsCompleteness !== undefined) result.materialsCompleteness = data.materialsCompleteness;
    if (data.instructionSupportLevel !== undefined) result.instructionSupportLevel = data.instructionSupportLevel;
    if (data.timeCommitmentDailyMinutes !== undefined) result.timeCommitmentDailyMinutes = data.timeCommitmentDailyMinutes;
    if (data.timeCommitmentWeeklyHours !== undefined) result.timeCommitmentWeeklyHours = data.timeCommitmentWeeklyHours;
    if (data.timeCommitmentFlexibility !== undefined) result.timeCommitmentFlexibility = data.timeCommitmentFlexibility;
    if (data.costValue !== undefined) result.costValue = data.costValue;

    // Array fields
    if (data.subjectIds !== undefined) result.subjectIds = data.subjectIds;
    if (data.materialsComponents !== undefined) result.materialsComponents = data.materialsComponents;
    if (data.strengths !== undefined) result.strengths = data.strengths;
    if (data.weaknesses !== undefined) result.weaknesses = data.weaknesses;
    if (data.bestFor !== undefined) result.bestFor = data.bestFor;

    // Boolean fields
    if (data.availabilityInPrint !== undefined) result.availabilityInPrint = data.availabilityInPrint;
    if (data.availabilityDigital !== undefined) result.availabilityDigital = data.availabilityDigital;
    if (data.availabilityUsedMarket !== undefined) result.availabilityUsedMarket = data.availabilityUsedMarket;

    return result;
  }
}