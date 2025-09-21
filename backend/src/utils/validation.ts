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

    // Optional field validations
    if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim().length === 0)) {
      errors.push('Name must be a non-empty string');
    }

    if (data.publisher !== undefined && (typeof data.publisher !== 'string' || data.publisher.trim().length === 0)) {
      errors.push('Publisher must be a non-empty string');
    }

    if (data.description !== undefined && (typeof data.description !== 'string' || data.description.trim().length === 0)) {
      errors.push('Description must be a non-empty string');
    }

    if (data.imageUrl !== undefined && data.imageUrl !== null && typeof data.imageUrl !== 'string') {
      errors.push('Image URL must be a string');
    }

    if (data.gradeLevelId !== undefined && typeof data.gradeLevelId !== 'string') {
      errors.push('Grade level ID must be a string');
    }

    // Rating validations
    const ratingFields = [
      'targetAgeGradeRating', 'teachingApproachRating', 'subjectsCoveredRating',
      'materialsIncludedRating', 'instructionStyleRating', 'timeCommitmentRating',
      'costRating', 'availabilityRating'
    ];

    ratingFields.forEach(field => {
      if (data[field] !== undefined && !this.isValidRating(data[field])) {
        errors.push(`${field} must be an integer between 1 and 5`);
      }
    });

    // Numeric field validations
    if (data.subjectComprehensiveness !== undefined && !this.isValidRating(data.subjectComprehensiveness)) {
      errors.push('Subject comprehensiveness must be an integer between 1 and 5');
    }

    if (data.materialsCompleteness !== undefined && !this.isValidRating(data.materialsCompleteness)) {
      errors.push('Materials completeness must be an integer between 1 and 5');
    }

    if (data.instructionSupportLevel !== undefined && !this.isValidRating(data.instructionSupportLevel)) {
      errors.push('Instruction support level must be an integer between 1 and 5');
    }

    if (data.timeCommitmentFlexibility !== undefined && !this.isValidRating(data.timeCommitmentFlexibility)) {
      errors.push('Time commitment flexibility must be an integer between 1 and 5');
    }

    if (data.costValue !== undefined && !this.isValidRating(data.costValue)) {
      errors.push('Cost value must be an integer between 1 and 5');
    }

    if (data.timeCommitmentDailyMinutes !== undefined && (typeof data.timeCommitmentDailyMinutes !== 'number' || data.timeCommitmentDailyMinutes < 0)) {
      errors.push('Daily minutes must be a non-negative number');
    }

    if (data.timeCommitmentWeeklyHours !== undefined && (typeof data.timeCommitmentWeeklyHours !== 'number' || data.timeCommitmentWeeklyHours < 0)) {
      errors.push('Weekly hours must be a non-negative number');
    }

    // String field validations
    if (data.teachingApproachStyle !== undefined && typeof data.teachingApproachStyle !== 'string') {
      errors.push('Teaching approach style must be a string');
    }

    if (data.teachingApproachDescription !== undefined && typeof data.teachingApproachDescription !== 'string') {
      errors.push('Teaching approach description must be a string');
    }

    if (data.instructionStyleType !== undefined && typeof data.instructionStyleType !== 'string') {
      errors.push('Instruction style type must be a string');
    }

    if (data.costPriceRange !== undefined && !this.isValidCostRange(data.costPriceRange)) {
      errors.push('Cost price range must be one of: $, $$, $$$, $$$$');
    }

    // Array field validations
    const arrayFields = ['subjectIds', 'materialsComponents', 'strengths', 'weaknesses', 'bestFor'];
    arrayFields.forEach(field => {
      if (data[field] !== undefined && !Array.isArray(data[field])) {
        errors.push(`${field} must be an array`);
      }
    });

    if (data.subjectIds !== undefined && Array.isArray(data.subjectIds)) {
      if (!data.subjectIds.every((id: any) => typeof id === 'string')) {
        errors.push('All subject IDs must be strings');
      }
    }

    if (data.materialsComponents !== undefined && Array.isArray(data.materialsComponents)) {
      if (!data.materialsComponents.every((component: any) => typeof component === 'string')) {
        errors.push('All material components must be strings');
      }
    }

    if (data.strengths !== undefined && Array.isArray(data.strengths)) {
      if (!data.strengths.every((strength: any) => typeof strength === 'string')) {
        errors.push('All strengths must be strings');
      }
    }

    if (data.weaknesses !== undefined && Array.isArray(data.weaknesses)) {
      if (!data.weaknesses.every((weakness: any) => typeof weakness === 'string')) {
        errors.push('All weaknesses must be strings');
      }
    }

    if (data.bestFor !== undefined && Array.isArray(data.bestFor)) {
      if (!data.bestFor.every((item: any) => typeof item === 'string')) {
        errors.push('All bestFor items must be strings');
      }
    }

    // Boolean field validations
    const booleanFields = ['availabilityInPrint', 'availabilityDigital', 'availabilityUsedMarket'];
    booleanFields.forEach(field => {
      if (data[field] !== undefined && typeof data[field] !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      }
    });

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', { errors });
    }

    // Return sanitized data
    const result: Partial<CurriculumRequest> = {};
    
    if (data.name !== undefined) result.name = data.name.trim();
    if (data.publisher !== undefined) result.publisher = data.publisher.trim();
    if (data.description !== undefined) result.description = data.description.trim();
    if (data.imageUrl !== undefined) result.imageUrl = data.imageUrl;
    if (data.gradeLevelId !== undefined) result.gradeLevelId = data.gradeLevelId;
    if (data.targetAgeGradeRating !== undefined) result.targetAgeGradeRating = data.targetAgeGradeRating;
    if (data.teachingApproachStyle !== undefined) result.teachingApproachStyle = data.teachingApproachStyle.trim();
    if (data.teachingApproachDescription !== undefined) result.teachingApproachDescription = data.teachingApproachDescription.trim();
    if (data.teachingApproachRating !== undefined) result.teachingApproachRating = data.teachingApproachRating;
    if (data.subjectIds !== undefined) result.subjectIds = data.subjectIds;
    if (data.subjectComprehensiveness !== undefined) result.subjectComprehensiveness = data.subjectComprehensiveness;
    if (data.subjectsCoveredRating !== undefined) result.subjectsCoveredRating = data.subjectsCoveredRating;
    if (data.materialsComponents !== undefined) result.materialsComponents = data.materialsComponents;
    if (data.materialsCompleteness !== undefined) result.materialsCompleteness = data.materialsCompleteness;
    if (data.materialsIncludedRating !== undefined) result.materialsIncludedRating = data.materialsIncludedRating;
    if (data.instructionStyleType !== undefined) result.instructionStyleType = data.instructionStyleType.trim();
    if (data.instructionSupportLevel !== undefined) result.instructionSupportLevel = data.instructionSupportLevel;
    if (data.instructionStyleRating !== undefined) result.instructionStyleRating = data.instructionStyleRating;
    if (data.timeCommitmentDailyMinutes !== undefined) result.timeCommitmentDailyMinutes = data.timeCommitmentDailyMinutes;
    if (data.timeCommitmentWeeklyHours !== undefined) result.timeCommitmentWeeklyHours = data.timeCommitmentWeeklyHours;
    if (data.timeCommitmentFlexibility !== undefined) result.timeCommitmentFlexibility = data.timeCommitmentFlexibility;
    if (data.timeCommitmentRating !== undefined) result.timeCommitmentRating = data.timeCommitmentRating;
    if (data.costPriceRange !== undefined) result.costPriceRange = data.costPriceRange;
    if (data.costValue !== undefined) result.costValue = data.costValue;
    if (data.costRating !== undefined) result.costRating = data.costRating;
    if (data.strengths !== undefined) result.strengths = data.strengths;
    if (data.weaknesses !== undefined) result.weaknesses = data.weaknesses;
    if (data.bestFor !== undefined) result.bestFor = data.bestFor;
    if (data.availabilityInPrint !== undefined) result.availabilityInPrint = data.availabilityInPrint;
    if (data.availabilityDigital !== undefined) result.availabilityDigital = data.availabilityDigital;
    if (data.availabilityUsedMarket !== undefined) result.availabilityUsedMarket = data.availabilityUsedMarket;
    if (data.availabilityRating !== undefined) result.availabilityRating = data.availabilityRating;

    return result;
  }
}