# Database Schema Documentation

## Overview

This database schema supports the Shelf Taught homeschool curriculum review website. It includes comprehensive models for curricula with detailed rating categories, user management, and curriculum categorization.

## Models

### User
Represents registered users of the platform (both regular users and administrators).

**Fields:**
- `id`: Unique identifier
- `email`: User's email address (unique)
- `firstName`, `lastName`: User's name
- `password`: Hashed password
- `role`: Either 'USER' or 'ADMIN'
- `createdAt`, `updatedAt`: Timestamps

**Relationships:**
- Has many `SavedCurriculum` records

### Subject
Represents curriculum subject categories (Math, Language Arts, Science, etc.).

**Fields:**
- `id`: Unique identifier
- `name`: Subject name (unique)
- `description`: Subject description

**Relationships:**
- Has many `CurriculumSubject` relationships

### GradeLevel
Represents age/grade ranges for curricula targeting.

**Fields:**
- `id`: Unique identifier
- `name`: Grade level name (unique)
- `ageRange`: Human-readable age range
- `minAge`, `maxAge`: Numeric age boundaries

**Relationships:**
- Has many `Curriculum` records

### Curriculum
The core model representing curriculum reviews with comprehensive rating categories.

**Basic Information:**
- `id`: Unique identifier
- `name`: Curriculum name
- `publisher`: Publisher name
- `description`: Curriculum description
- `imageUrl`: Optional curriculum image
- `gradeLevelId`: Reference to target grade level

**Rating Categories (1-5 scale):**

1. **Target Age/Grade**
   - `targetAgeGradeRating`: How well it fits the target age

2. **Teaching Approach**
   - `teachingApproachStyle`: Style (e.g., "Traditional", "Charlotte Mason")
   - `teachingApproachDescription`: Detailed description
   - `teachingApproachRating`: Rating for the approach

3. **Subjects Covered**
   - `subjectComprehensiveness`: How comprehensive the subject coverage is
   - `subjectsCoveredRating`: Overall rating for subject coverage

4. **Materials Included**
   - `materialsComponents`: Array of included components
   - `materialsCompleteness`: How complete the materials are
   - `materialsIncludedRating`: Overall materials rating

5. **Instruction Style**
   - `instructionStyleType`: Type (e.g., "Parent-led", "Self-directed")
   - `instructionSupportLevel`: Level of support provided
   - `instructionStyleRating`: Overall instruction rating

6. **Time Commitment**
   - `timeCommitmentDailyMinutes`: Daily time requirement
   - `timeCommitmentWeeklyHours`: Weekly time requirement
   - `timeCommitmentFlexibility`: How flexible the schedule is
   - `timeCommitmentRating`: Overall time commitment rating

7. **Cost**
   - `costPriceRange`: Price range ("$", "$$", "$$$", "$$$$")
   - `costValue`: Value for money rating
   - `costRating`: Overall cost rating

8. **Availability**
   - `availabilityInPrint`: Available in print
   - `availabilityDigital`: Available digitally
   - `availabilityUsedMarket`: Available on used market
   - `availabilityRating`: Overall availability rating

**Additional Information:**
- `strengths`: Array of curriculum strengths
- `weaknesses`: Array of curriculum weaknesses
- `bestFor`: Array describing who it's best suited for
- `overallRating`: Calculated overall rating
- `reviewCount`: Number of reviews
- `createdAt`, `updatedAt`: Timestamps

**Relationships:**
- Belongs to one `GradeLevel`
- Has many `CurriculumSubject` relationships
- Has many `SavedCurriculum` records

### CurriculumSubject
Junction table linking curricula to subjects (many-to-many relationship).

**Fields:**
- `id`: Unique identifier
- `curriculumId`: Reference to curriculum
- `subjectId`: Reference to subject

### SavedCurriculum
Represents curricula saved by users to their personal lists.

**Fields:**
- `id`: Unique identifier
- `userId`: Reference to user
- `curriculumId`: Reference to curriculum
- `personalNotes`: Optional user notes
- `savedAt`: When it was saved

## Sample Data

The seed script includes:

### Subjects
- Language Arts
- Mathematics
- Science
- History
- Phonics
- Spelling

### Grade Levels
- Preschool (3-5 years)
- Kindergarten (5-6 years)
- Elementary (K-5, 5-11 years)
- Middle School (6-8, 11-14 years)
- High School (9-12, 14-18 years)

### Sample Curricula
1. **Logic of English Foundations** - Comprehensive phonics program
2. **Math-U-See** - Mastery-based math with manipulatives
3. **Sonlight Core A** - Literature-based curriculum

### Sample Users
- Admin user: admin@shelftaught.com
- Regular user: parent@example.com

## Usage

### Running Migrations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (requires database)
npm run db:migrate

# Seed database (requires database)
npm run db:seed
```

### Schema Validation
```bash
# Validate schema without database connection
npx ts-node src/validate-schema.ts
```

### Database Operations
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Find curricula with subjects
const curricula = await prisma.curriculum.findMany({
  include: {
    gradeLevel: true,
    curriculumSubjects: {
      include: {
        subject: true
      }
    }
  }
});

// Save curriculum for user
await prisma.savedCurriculum.create({
  data: {
    userId: 'user-id',
    curriculumId: 'curriculum-id',
    personalNotes: 'Looks great for my child'
  }
});
```

## Requirements Mapping

This schema addresses the following requirements:

- **1.3**: Detailed curriculum information with all rating categories
- **2.1**: Comprehensive rating system across multiple dimensions
- **2.2**: Structured review data with ratings and descriptions
- **3.2**: Admin content management capabilities
- **5.1**: User account system with saved curricula
- **6.2**: Categorization system with subjects and grade levels

The schema supports all the functionality needed for the homeschool curriculum review website as specified in the design document.