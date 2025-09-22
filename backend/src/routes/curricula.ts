import { Router, Request, Response } from 'express';
import { ValidationUtils } from '../utils/validation';
import { NotFoundError, ValidationError } from '../types/errors';
import { asyncHandler } from '../middleware/errorHandler';
import DatabaseService from '../services/database';
import { SlugUtils } from '../utils/slug';

const router = Router();

/**
 * GET /api/curricula
 * Get curricula with filtering, pagination, and search functionality
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  // Parse and validate query parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  
  // Build where clause for filtering
  const where: any = {};
  
  // Filter by grade level
  if (req.query.gradeLevel) {
    where.gradeLevelId = req.query.gradeLevel as string;
  }
  
  // Filter by subjects
  if (req.query.subjects) {
    const subjects = Array.isArray(req.query.subjects) 
      ? req.query.subjects 
      : [req.query.subjects];
    
    where.curriculumSubjects = {
      some: {
        subject: {
          name: {
            in: subjects
          }
        }
      }
    };
  }
  
  // Filter by teaching approach
  if (req.query.teachingApproach) {
    where.teachingApproachStyle = {
      contains: req.query.teachingApproach as string,
      mode: 'insensitive'
    };
  }
  
  // Filter by cost range
  if (req.query.costRange) {
    where.costPriceRange = req.query.costRange as string;
  }
  
  // Filter by minimum rating
  if (req.query.minRating) {
    const minRating = parseFloat(req.query.minRating as string);
    if (!isNaN(minRating)) {
      where.overallRating = {
        gte: minRating
      };
    }
  }
  
  // Search functionality
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { publisher: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { teachingApproachDescription: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }
  
  // Sorting
  const sortBy = req.query.sortBy as string || 'name';
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'asc';
  
  const validSortFields = ['name', 'publisher', 'overallRating', 'createdAt', 'costPriceRange'];
  const orderBy: any = validSortFields.includes(sortBy) 
    ? { [sortBy]: sortOrder }
    : { name: 'asc' };
  
  // Execute queries
  const [curricula, totalCount] = await Promise.all([
    prisma.curriculum.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        gradeLevel: {
          select: {
            id: true,
            name: true,
            ageRange: true
          }
        },
        curriculumSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    }),
    prisma.curriculum.count({ where })
  ]);
  
  // Transform data for response
  const transformedCurricula = curricula.map((curriculum: any) => ({
    id: curriculum.id,
    name: curriculum.name,
    publisher: curriculum.publisher,
    description: curriculum.description,
    imageUrl: curriculum.imageUrl,
    gradeLevel: curriculum.gradeLevel,
    subjects: curriculum.curriculumSubjects?.map((cs: any) => cs.subject) || [],
    teachingApproach: {
      style: curriculum.teachingApproachStyle,
      rating: curriculum.teachingApproachRating
    },
    cost: {
      priceRange: curriculum.costPriceRange,
      rating: curriculum.costRating
    },
    overallRating: curriculum.overallRating,
    reviewCount: curriculum.reviewCount,
    createdAt: curriculum.createdAt
  }));
  
  const totalPages = Math.ceil(totalCount / limit);
  
  res.success({
    curricula: transformedCurricula,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

/**
 * GET /api/curricula/:slugOrId
 * Get detailed curriculum information by slug or ID (for backward compatibility)
 */
router.get('/:slugOrId', asyncHandler(async (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const prisma = DatabaseService.getInstance();
  
  if (!slugOrId) {
    throw new ValidationError('Curriculum slug or ID is required');
  }
  
  // Try to find by slug first, then by ID for backward compatibility
  let curriculum = await prisma.curriculum.findUnique({
    where: { slug: slugOrId },
    include: {
      gradeLevel: {
        select: {
          id: true,
          name: true,
          ageRange: true,
          minAge: true,
          maxAge: true
        }
      },
      curriculumSubjects: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      }
    }
  });
  
  // If not found by slug, try by ID for backward compatibility
  if (!curriculum) {
    curriculum = await prisma.curriculum.findUnique({
      where: { id: slugOrId },
      include: {
        gradeLevel: {
          select: {
            id: true,
            name: true,
            ageRange: true,
            minAge: true,
            maxAge: true
          }
        },
        curriculumSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                description: true
              }
            }
          }
        }
      }
    });
  }
  
  if (!curriculum) {
    throw new NotFoundError('Curriculum not found');
  }
  
  // Transform data for detailed response
  const detailedCurriculum = {
    id: curriculum.id,
    name: curriculum.name,
    publisher: curriculum.publisher,
    description: curriculum.description,
    imageUrl: curriculum.imageUrl,
    
    targetAgeGrade: {
      gradeLevel: curriculum.gradeLevel,
      rating: curriculum.targetAgeGradeRating
    },
    
    teachingApproach: {
      style: curriculum.teachingApproachStyle,
      description: curriculum.teachingApproachDescription,
      rating: curriculum.teachingApproachRating
    },
    
    subjectsCovered: {
      subjects: (curriculum as any).curriculumSubjects?.map((cs: any) => cs.subject) || [],
      comprehensiveness: curriculum.subjectComprehensiveness,
      rating: curriculum.subjectsCoveredRating
    },
    
    materialsIncluded: {
      components: curriculum.materialsComponents,
      completeness: curriculum.materialsCompleteness,
      rating: curriculum.materialsIncludedRating
    },
    
    instructionStyle: {
      type: curriculum.instructionStyleType,
      supportLevel: curriculum.instructionSupportLevel,
      rating: curriculum.instructionStyleRating
    },
    
    timeCommitment: {
      dailyMinutes: curriculum.timeCommitmentDailyMinutes,
      weeklyHours: curriculum.timeCommitmentWeeklyHours,
      flexibility: curriculum.timeCommitmentFlexibility,
      rating: curriculum.timeCommitmentRating
    },
    
    cost: {
      priceRange: curriculum.costPriceRange,
      value: curriculum.costValue,
      rating: curriculum.costRating
    },
    
    strengths: curriculum.strengths,
    weaknesses: curriculum.weaknesses,
    bestFor: curriculum.bestFor,
    
    availability: {
      inPrint: curriculum.availabilityInPrint,
      digitalAvailable: curriculum.availabilityDigital,
      usedMarket: curriculum.availabilityUsedMarket,
      rating: curriculum.availabilityRating
    },
    
    overallRating: curriculum.overallRating,
    reviewCount: curriculum.reviewCount,
    createdAt: curriculum.createdAt,
    updatedAt: curriculum.updatedAt
  };
  
  res.success({ curriculum: detailedCurriculum });
}));

export default router;