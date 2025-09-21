# Design Document - Shelf Taught Homeschool Curriculum Review Website

## Overview

Shelf Taught is a modern web application built to help homeschooling families discover and evaluate educational curricula through comprehensive reviews and ratings. The platform features a clean, user-friendly interface with robust search and filtering capabilities, detailed curriculum profiles, and user account management for saving and organizing preferred curricula.

The application will be built as a full-stack web application with a React frontend, Node.js/Express backend, and PostgreSQL database. The design prioritizes performance, SEO optimization, and mobile responsiveness to serve the diverse needs of the homeschooling community.

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Express API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   File Storage  │◄─────────────┘
                        │   (Images/Docs) │
                        └─────────────────┘
```

### Technology Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS for styling, React Router for navigation
- **Backend**: Node.js with Express.js, TypeScript for type safety
- **Database**: PostgreSQL with Prisma ORM for data modeling and migrations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Storage**: Local file system for curriculum images and documents
- **Search**: Full-text search using PostgreSQL's built-in search capabilities
- **Deployment**: Docker containers for consistent deployment

## Components and Interfaces

### Frontend Components

#### Core Layout Components
- **Header**: Navigation bar with logo, search bar, and user menu
- **Footer**: Site links, contact information, and social media
- **Sidebar**: Category filters and quick navigation
- **SearchBar**: Global search with autocomplete suggestions

#### Page Components
- **HomePage**: Featured curricula, search interface, category browsing
- **CurriculumDetailPage**: Complete curriculum review with all rating categories
- **SearchResultsPage**: Paginated search results with filtering options
- **UserDashboard**: Saved curricula, personal notes, account settings
- **AdminPanel**: Curriculum management, user management, analytics

#### Curriculum Components
- **CurriculumCard**: Summary card showing key information and ratings
- **RatingDisplay**: Visual representation of ratings across all categories
- **ComparisonTable**: Side-by-side curriculum comparison
- **ReviewForm**: Admin form for creating/editing curriculum reviews

### Backend API Endpoints

#### Public Endpoints
```
GET /api/curricula - Get curricula with filtering and pagination
GET /api/curricula/:id - Get detailed curriculum information
GET /api/search - Search curricula with query parameters
GET /api/categories - Get all subject categories and grade levels
```

#### Authenticated Endpoints
```
POST /api/auth/login - User authentication
POST /api/auth/register - User registration
GET /api/user/saved - Get user's saved curricula
POST /api/user/saved - Save curriculum to user's list
DELETE /api/user/saved/:id - Remove curriculum from saved list
```

#### Admin Endpoints
```
POST /api/admin/curricula - Create new curriculum
PUT /api/admin/curricula/:id - Update curriculum
DELETE /api/admin/curricula/:id - Delete curriculum
GET /api/admin/analytics - Get site usage analytics
```

## Data Models

### Curriculum Model
```typescript
interface Curriculum {
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
    rating: number; // 1-5 scale
  };
  
  teachingApproach: {
    style: string; // "Traditional", "Charlotte Mason", "Unit Studies", etc.
    description: string;
    rating: number;
  };
  
  subjectsCovered: {
    subjects: string[];
    comprehensiveness: number; // 1-5 scale
    rating: number;
  };
  
  materialsIncluded: {
    components: string[];
    completeness: number; // 1-5 scale
    rating: number;
  };
  
  instructionStyle: {
    type: string; // "Self-directed", "Parent-led", "Video-based", etc.
    supportLevel: number; // 1-5 scale
    rating: number;
  };
  
  timeCommitment: {
    dailyMinutes: number;
    weeklyHours: number;
    flexibility: number; // 1-5 scale
    rating: number;
  };
  
  cost: {
    priceRange: string; // "$", "$$", "$$$", "$$$$"
    value: number; // 1-5 scale
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
  
  overallRating: number; // Calculated average
  reviewCount: number;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### User Model
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  savedCurricula: SavedCurriculum[];
  createdAt: Date;
  updatedAt: Date;
}

interface SavedCurriculum {
  id: string;
  userId: string;
  curriculumId: string;
  personalNotes?: string;
  savedAt: Date;
}
```

### Category Models
```typescript
interface Subject {
  id: string;
  name: string;
  description: string;
  curriculumCount: number;
}

interface GradeLevel {
  id: string;
  name: string;
  ageRange: string;
  curriculumCount: number;
}
```

## Error Handling

### Frontend Error Handling
- **Network Errors**: Display user-friendly messages with retry options
- **Validation Errors**: Real-time form validation with clear error messages
- **404 Errors**: Custom not-found pages with navigation suggestions
- **Loading States**: Skeleton screens and loading indicators for better UX

### Backend Error Handling
- **Input Validation**: Comprehensive validation using Joi or similar library
- **Database Errors**: Proper error logging and generic user messages
- **Authentication Errors**: Clear messaging for login/permission issues
- **Rate Limiting**: Implement rate limiting to prevent abuse

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest and React Testing Library for component testing
- **Integration Tests**: Test user workflows and component interactions
- **E2E Tests**: Cypress for critical user journeys (search, save, compare)
- **Accessibility Tests**: Automated accessibility testing with axe-core

### Backend Testing
- **Unit Tests**: Jest for individual function and middleware testing
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: Test database operations with test database
- **Performance Tests**: Load testing for search and filtering operations

### Test Coverage Goals
- Minimum 80% code coverage for both frontend and backend
- 100% coverage for critical paths (authentication, data integrity)
- Regular performance benchmarking for search functionality

### Testing Data
- Seed database with representative curriculum data for testing
- Mock external services and file uploads in test environment
- Automated testing pipeline with CI/CD integration