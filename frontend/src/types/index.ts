// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
}

// Curriculum types
export interface Curriculum {
  id: string;
  name: string;
  publisher: string;
  description: string;
  imageUrl?: string;
  
  // Rating Categories
  targetAgeGrade: {
    minAge: number;
    maxAge: number;
    gradeRange: string;
    rating: number;
  };
  
  teachingApproach: {
    style: string;
    description: string;
    rating: number;
  };
  
  subjectsCovered: {
    subjects: string[];
    comprehensiveness: number;
    rating: number;
  };
  
  materialsIncluded: {
    components: string[];
    completeness: number;
    rating: number;
  };
  
  instructionStyle: {
    type: string;
    supportLevel: number;
    rating: number;
  };
  
  timeCommitment: {
    dailyMinutes: number;
    weeklyHours: number;
    flexibility: number;
    rating: number;
  };
  
  cost: {
    priceRange: string;
    value: number;
    rating: number;
  };
  
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  
  availability: {
    inPrint: boolean;
    digitalAvailable: boolean;
    usedMarket: boolean;
    rating: number;
  };
  
  // Full review text
  fullReview?: string;
  
  overallRating: number;
  reviewCount: number;
  
  createdAt: string;
  updatedAt: string;
}

// Saved curriculum types
export interface SavedCurriculum {
  id: string;
  userId: string;
  curriculumId: string;
  personalNotes?: string;
  savedAt: string;
  curriculum?: Curriculum;
}

// Category types
export interface Subject {
  id: string;
  name: string;
  description: string;
  curriculumCount: number;
}

export interface GradeLevel {
  id: string;
  name: string;
  ageRange: string;
  curriculumCount: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Search and filter types
export interface SearchFilters {
  subjects?: string[];
  gradeLevel?: string[];
  teachingApproach?: string[];
  priceRange?: string[];
  availability?: string[];
  minRating?: number;
  maxRating?: number;
}

export interface SearchParams extends SearchFilters {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'name' | 'publisher' | 'createdAt' | 'popularity' | 'cost' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}