import { Router, Request, Response } from 'express';
import { ValidationError, NotFoundError } from '../types/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate, requireAdmin } from '../middleware/auth';
import { ValidationUtils } from '../utils/validation';
import DatabaseService from '../services/database';
import { SlugUtils } from '../utils/slug';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/curricula
 * Get curricula for admin management with additional metadata
 */
router.get('/curricula', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  // Parse and validate query parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  
  // Build where clause for filtering
  const where: any = {};
  
  // Search functionality
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { publisher: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }
  
  // Sorting
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
  
  const validSortFields = ['name', 'publisher', 'overallRating', 'createdAt'];
  const orderBy: any = validSortFields.includes(sortBy) 
    ? { [sortBy]: sortOrder }
    : { createdAt: 'desc' };
  
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
        },
        _count: {
          select: {
            savedBy: true
          }
        }
      }
    }),
    prisma.curriculum.count({ where })
  ]);
  
  // Transform data for admin response
  const transformedCurricula = curricula.map((curriculum: any) => ({
    id: curriculum.id,
    name: curriculum.name,
    publisher: curriculum.publisher,
    description: curriculum.description,
    imageUrl: curriculum.imageUrl,
    gradeLevel: curriculum.gradeLevel,
    subjects: curriculum.curriculumSubjects?.map((cs: any) => cs.subject) || [],
    teachingApproachStyle: curriculum.teachingApproachStyle,
    costPriceRange: curriculum.costPriceRange,
    timeCommitmentDailyMinutes: curriculum.timeCommitmentDailyMinutes,
    overallRating: curriculum.overallRating,
    reviewCount: curriculum.reviewCount,
    createdAt: curriculum.createdAt,
    updatedAt: curriculum.updatedAt,
    _count: curriculum._count
  }));
  
  const totalPages = Math.ceil(totalCount / limit);
  
  res.success({
    curricula: transformedCurricula,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit
    }
  });
}));

/**
 * POST /api/admin/curricula
 * Create new curriculum review
 */
router.post('/curricula', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  // Validate request data
  const validatedData = ValidationUtils.validateCurriculumRequest(req.body, false);
  
  const {
    name,
    publisher,
    description,
    imageUrl,
    gradeLevelId,
    targetAgeGradeRating,
    teachingApproachStyle,
    teachingApproachDescription,
    teachingApproachRating,
    subjectIds,
    subjectComprehensiveness,
    subjectsCoveredRating,
    materialsComponents,
    materialsCompleteness,
    materialsIncludedRating,
    instructionStyleType,
    instructionSupportLevel,
    instructionStyleRating,
    timeCommitmentDailyMinutes,
    timeCommitmentWeeklyHours,
    timeCommitmentFlexibility,
    timeCommitmentRating,
    costPriceRange,
    costValue,
    costRating,
    strengths,
    weaknesses,
    bestFor,
    availabilityInPrint,
    availabilityDigital,
    availabilityUsedMarket,
    availabilityRating
  } = validatedData;

  // Verify grade level exists
  const gradeLevel = await prisma.gradeLevel.findUnique({
    where: { id: gradeLevelId }
  });
  
  if (!gradeLevel) {
    throw new ValidationError('Invalid grade level ID');
  }

  // Verify subject IDs exist if provided
  if (subjectIds && subjectIds.length > 0) {
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } }
    });
    
    if (subjects.length !== subjectIds.length) {
      throw new ValidationError('One or more subject IDs are invalid');
    }
  }

  // Generate unique slug with error handling
  let slug: string;
  try {
    const baseSlug = SlugUtils.createCurriculumSlug(name!, publisher!);
    slug = await SlugUtils.ensureUniqueSlug(
      baseSlug,
      async (checkSlug) => {
        try {
          const existing = await prisma.curriculum.findUnique({ where: { slug: checkSlug } });
          return !!existing;
        } catch (error) {
          // If slug column doesn't exist yet, return false to allow creation
          console.warn('Slug uniqueness check failed, assuming unique:', error);
          return false;
        }
      }
    );
  } catch (error) {
    // Fallback slug generation if SlugUtils fails
    console.warn('Slug generation failed, using fallback:', error);
    slug = `${name!.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
  }

  // Calculate overall rating
  const ratings = [
    targetAgeGradeRating || 0,
    teachingApproachRating || 0,
    subjectsCoveredRating || 0,
    materialsIncludedRating || 0,
    instructionStyleRating || 0,
    timeCommitmentRating || 0,
    costRating || 0,
    availabilityRating || 0
  ].filter(rating => rating > 0);
  
  const overallRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
    : 0;

  // Create curriculum with optional slug
  const curriculumData: any = {
    name: name!,
    publisher: publisher!,
    description: description!,
    imageUrl,
    gradeLevelId: gradeLevelId!,
      targetAgeGradeRating: targetAgeGradeRating || 0,
      teachingApproachStyle: teachingApproachStyle || '',
      teachingApproachDescription: teachingApproachDescription || '',
      teachingApproachRating: teachingApproachRating || 0,
      subjectComprehensiveness: subjectComprehensiveness || 0,
      subjectsCoveredRating: subjectsCoveredRating || 0,
      materialsComponents: materialsComponents || [],
      materialsCompleteness: materialsCompleteness || 0,
      materialsIncludedRating: materialsIncludedRating || 0,
      instructionStyleType: instructionStyleType || '',
      instructionSupportLevel: instructionSupportLevel || 0,
      instructionStyleRating: instructionStyleRating || 0,
      timeCommitmentDailyMinutes: timeCommitmentDailyMinutes || 0,
      timeCommitmentWeeklyHours: timeCommitmentWeeklyHours || 0,
      timeCommitmentFlexibility: timeCommitmentFlexibility || 0,
      timeCommitmentRating: timeCommitmentRating || 0,
      costPriceRange: costPriceRange || '$',
      costValue: costValue || 0,
      costRating: costRating || 0,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
      bestFor: bestFor || [],
      availabilityInPrint: availabilityInPrint !== false,
      availabilityDigital: availabilityDigital === true,
      availabilityUsedMarket: availabilityUsedMarket === true,
      availabilityRating: availabilityRating || 0,
      overallRating,
      reviewCount: 1
    };

  // Add slug if available
  if (slug) {
    curriculumData.slug = slug;
  }

  // Create curriculum
  const curriculum = await prisma.curriculum.create({
    data: curriculumData,
    include: {
      gradeLevel: true
    }
  });

  // Create curriculum-subject relationships if subjects provided
  if (subjectIds && subjectIds.length > 0) {
    await prisma.curriculumSubject.createMany({
      data: subjectIds.map((subjectId: string) => ({
        curriculumId: curriculum.id,
        subjectId
      }))
    });
  }

  res.success({ curriculum }, 'Curriculum created successfully');
}));

/**
 * PUT /api/admin/curricula/:id
 * Update existing curriculum review
 */
router.put('/curricula/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const prisma = DatabaseService.getInstance();
  
  if (!id) {
    throw new ValidationError('Curriculum ID is required');
  }

  // Check if curriculum exists
  const existingCurriculum = await prisma.curriculum.findUnique({
    where: { id },
    include: {
      curriculumSubjects: true
    }
  });
  
  if (!existingCurriculum) {
    throw new NotFoundError('Curriculum not found');
  }

  // Validate request data for update
  const validatedData = ValidationUtils.validateCurriculumRequest(req.body, true);

  const {
    name,
    publisher,
    description,
    imageUrl,
    gradeLevelId,
    targetAgeGradeRating,
    teachingApproachStyle,
    teachingApproachDescription,
    teachingApproachRating,
    subjectIds,
    subjectComprehensiveness,
    subjectsCoveredRating,
    materialsComponents,
    materialsCompleteness,
    materialsIncludedRating,
    instructionStyleType,
    instructionSupportLevel,
    instructionStyleRating,
    timeCommitmentDailyMinutes,
    timeCommitmentWeeklyHours,
    timeCommitmentFlexibility,
    timeCommitmentRating,
    costPriceRange,
    costValue,
    costRating,
    strengths,
    weaknesses,
    bestFor,
    availabilityInPrint,
    availabilityDigital,
    availabilityUsedMarket,
    availabilityRating
  } = validatedData;

  // Verify grade level exists if provided
  if (gradeLevelId) {
    const gradeLevel = await prisma.gradeLevel.findUnique({
      where: { id: gradeLevelId }
    });
    
    if (!gradeLevel) {
      throw new ValidationError('Invalid grade level ID');
    }
  }

  // Verify subject IDs exist if provided
  if (subjectIds && subjectIds.length > 0) {
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } }
    });
    
    if (subjects.length !== subjectIds.length) {
      throw new ValidationError('One or more subject IDs are invalid');
    }
  }

  // Generate new slug if name or publisher changed
  let slug = existingCurriculum.slug;
  if (name !== undefined || publisher !== undefined) {
    const newName = name ?? existingCurriculum.name;
    const newPublisher = publisher ?? existingCurriculum.publisher;
    const baseSlug = SlugUtils.createCurriculumSlug(newName, newPublisher);
    
    // Only update slug if it would be different
    if (baseSlug !== existingCurriculum.slug) {
      slug = await SlugUtils.ensureUniqueSlug(
        baseSlug,
        async (checkSlug) => {
          const existing = await prisma.curriculum.findUnique({ where: { slug: checkSlug } });
          return !!existing && existing.id !== id;
        },
        id
      );
    }
  }

  // Calculate overall rating if ratings are provided
  let overallRating = existingCurriculum.overallRating;
  
  const ratings = [
    targetAgeGradeRating ?? existingCurriculum.targetAgeGradeRating,
    teachingApproachRating ?? existingCurriculum.teachingApproachRating,
    subjectsCoveredRating ?? existingCurriculum.subjectsCoveredRating,
    materialsIncludedRating ?? existingCurriculum.materialsIncludedRating,
    instructionStyleRating ?? existingCurriculum.instructionStyleRating,
    timeCommitmentRating ?? existingCurriculum.timeCommitmentRating,
    costRating ?? existingCurriculum.costRating,
    availabilityRating ?? existingCurriculum.availabilityRating
  ].filter(rating => rating > 0);
  
  if (ratings.length > 0) {
    overallRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  // Update curriculum
  const updatedCurriculum = await prisma.curriculum.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(publisher !== undefined && { publisher }),
      ...(slug !== existingCurriculum.slug && { slug }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(gradeLevelId !== undefined && { gradeLevelId }),
      ...(targetAgeGradeRating !== undefined && { targetAgeGradeRating }),
      ...(teachingApproachStyle !== undefined && { teachingApproachStyle }),
      ...(teachingApproachDescription !== undefined && { teachingApproachDescription }),
      ...(teachingApproachRating !== undefined && { teachingApproachRating }),
      ...(subjectComprehensiveness !== undefined && { subjectComprehensiveness }),
      ...(subjectsCoveredRating !== undefined && { subjectsCoveredRating }),
      ...(materialsComponents !== undefined && { materialsComponents }),
      ...(materialsCompleteness !== undefined && { materialsCompleteness }),
      ...(materialsIncludedRating !== undefined && { materialsIncludedRating }),
      ...(instructionStyleType !== undefined && { instructionStyleType }),
      ...(instructionSupportLevel !== undefined && { instructionSupportLevel }),
      ...(instructionStyleRating !== undefined && { instructionStyleRating }),
      ...(timeCommitmentDailyMinutes !== undefined && { timeCommitmentDailyMinutes }),
      ...(timeCommitmentWeeklyHours !== undefined && { timeCommitmentWeeklyHours }),
      ...(timeCommitmentFlexibility !== undefined && { timeCommitmentFlexibility }),
      ...(timeCommitmentRating !== undefined && { timeCommitmentRating }),
      ...(costPriceRange !== undefined && { costPriceRange }),
      ...(costValue !== undefined && { costValue }),
      ...(costRating !== undefined && { costRating }),
      ...(strengths !== undefined && { strengths }),
      ...(weaknesses !== undefined && { weaknesses }),
      ...(bestFor !== undefined && { bestFor }),
      ...(availabilityInPrint !== undefined && { availabilityInPrint }),
      ...(availabilityDigital !== undefined && { availabilityDigital }),
      ...(availabilityUsedMarket !== undefined && { availabilityUsedMarket }),
      ...(availabilityRating !== undefined && { availabilityRating }),
      overallRating
    },
    include: {
      gradeLevel: true
    }
  });

  // Update curriculum-subject relationships if subjects provided
  if (subjectIds !== undefined) {
    // Delete existing relationships
    await prisma.curriculumSubject.deleteMany({
      where: { curriculumId: id }
    });

    // Create new relationships
    if (subjectIds.length > 0) {
      await prisma.curriculumSubject.createMany({
        data: subjectIds.map((subjectId: string) => ({
          curriculumId: id,
          subjectId
        }))
      });
    }
  }

  res.success({ curriculum: updatedCurriculum }, 'Curriculum updated successfully');
}));

/**
 * DELETE /api/admin/curricula/:id
 * Delete curriculum
 */
router.delete('/curricula/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const prisma = DatabaseService.getInstance();
  
  if (!id) {
    throw new ValidationError('Curriculum ID is required');
  }

  // Check if curriculum exists
  const curriculum = await prisma.curriculum.findUnique({
    where: { id }
  });
  
  if (!curriculum) {
    throw new NotFoundError('Curriculum not found');
  }

  // Delete curriculum (cascade will handle related records)
  await prisma.curriculum.delete({
    where: { id }
  });

  res.success({ id }, 'Curriculum deleted successfully');
}));

/**
 * GET /api/admin/analytics
 * Get site usage statistics
 */
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  // Get basic counts
  const [
    totalCurricula,
    totalUsers,
    totalSavedCurricula,
    totalSubjects,
    totalGradeLevels
  ] = await Promise.all([
    prisma.curriculum.count(),
    prisma.user.count(),
    prisma.savedCurriculum.count(),
    prisma.subject.count(),
    prisma.gradeLevel.count()
  ]);

  // Get top-rated curricula
  const topRatedCurricula = await prisma.curriculum.findMany({
    take: 10,
    orderBy: { overallRating: 'desc' },
    select: {
      id: true,
      name: true,
      publisher: true,
      overallRating: true,
      reviewCount: true
    }
  });

  // Get most saved curricula
  const mostSavedCurricula = await prisma.curriculum.findMany({
    take: 10,
    orderBy: {
      savedBy: {
        _count: 'desc'
      }
    },
    select: {
      id: true,
      name: true,
      publisher: true,
      overallRating: true,
      _count: {
        select: {
          savedBy: true
        }
      }
    }
  });

  // Get curricula by grade level distribution
  const curriculaByGradeLevel = await prisma.gradeLevel.findMany({
    select: {
      id: true,
      name: true,
      ageRange: true,
      _count: {
        select: {
          curricula: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Get curricula by subject distribution
  const curriculaBySubject = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          curriculumSubjects: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [recentCurricula, recentUsers, recentSaves] = await Promise.all([
    prisma.curriculum.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    }),
    prisma.savedCurriculum.count({
      where: {
        savedAt: {
          gte: thirtyDaysAgo
        }
      }
    })
  ]);

  // Get average ratings
  const avgRatings = await prisma.curriculum.aggregate({
    _avg: {
      overallRating: true,
      targetAgeGradeRating: true,
      teachingApproachRating: true,
      subjectsCoveredRating: true,
      materialsIncludedRating: true,
      instructionStyleRating: true,
      timeCommitmentRating: true,
      costRating: true,
      availabilityRating: true
    }
  });

  const analytics = {
    overview: {
      totalCurricula,
      totalUsers,
      totalSavedCurricula,
      totalSubjects,
      totalGradeLevels
    },
    recentActivity: {
      newCurricula: recentCurricula,
      newUsers: recentUsers,
      newSaves: recentSaves
    },
    topPerforming: {
      topRatedCurricula,
      mostSavedCurricula: mostSavedCurricula.map(curriculum => ({
        ...curriculum,
        saveCount: curriculum._count.savedBy
      }))
    },
    distribution: {
      byGradeLevel: curriculaByGradeLevel.map(grade => ({
        ...grade,
        curriculumCount: grade._count.curricula
      })),
      bySubject: curriculaBySubject.map(subject => ({
        ...subject,
        curriculumCount: subject._count.curriculumSubjects
      }))
    },
    averageRatings: {
      overall: avgRatings._avg.overallRating || 0,
      targetAgeGrade: avgRatings._avg.targetAgeGradeRating || 0,
      teachingApproach: avgRatings._avg.teachingApproachRating || 0,
      subjectsCovered: avgRatings._avg.subjectsCoveredRating || 0,
      materialsIncluded: avgRatings._avg.materialsIncludedRating || 0,
      instructionStyle: avgRatings._avg.instructionStyleRating || 0,
      timeCommitment: avgRatings._avg.timeCommitmentRating || 0,
      cost: avgRatings._avg.costRating || 0,
      availability: avgRatings._avg.availabilityRating || 0
    }
  };

  res.success({ analytics }, 'Analytics retrieved successfully');
}));

/**
 * GET /api/admin/users
 * Get users for admin management with pagination and filtering
 */
router.get('/users', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  // Parse and validate query parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  
  // Build where clause for filtering
  const where: any = {};
  
  // Search functionality
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    where.OR = [
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }
  
  // Role filter
  if (req.query.role && req.query.role !== 'all') {
    where.role = req.query.role as string;
  }
  
  // Sorting
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
  
  const validSortFields = ['firstName', 'lastName', 'email', 'role', 'createdAt'];
  const orderBy: any = validSortFields.includes(sortBy) 
    ? { [sortBy]: sortOrder }
    : { createdAt: 'desc' };
  
  // Execute queries
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            savedCurricula: true
          }
        }
      }
    }),
    prisma.user.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalCount / limit);
  
  res.success({
    users,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limit
    }
  });
}));

/**
 * PUT /api/admin/users/:id
 * Update user role
 */
router.put('/users/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const prisma = DatabaseService.getInstance();
  
  if (!id) {
    throw new ValidationError('User ID is required');
  }
  
  if (!role || !['USER', 'ADMIN'].includes(role)) {
    throw new ValidationError('Valid role is required (USER or ADMIN)');
  }
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id }
  });
  
  if (!existingUser) {
    throw new NotFoundError('User not found');
  }
  
  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true
    }
  });
  
  res.success({ user: updatedUser }, 'User role updated successfully');
}));

/**
 * GET /api/admin/moderation
 * Get content moderation items (placeholder implementation)
 */
router.get('/moderation', asyncHandler(async (req: Request, res: Response) => {
  // This is a placeholder implementation since we don't have a reporting system yet
  // In a real app, this would fetch reported content, reviews, etc.
  
  const mockModerationItems = [
    {
      id: '1',
      type: 'review',
      content: 'Sample review content that might need moderation',
      author: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      reports: [
        {
          id: '1',
          reason: 'Inappropriate content',
          reportedAt: new Date().toISOString(),
          reportedBy: 'user123'
        }
      ]
    }
  ];
  
  res.success({
    items: mockModerationItems,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: mockModerationItems.length,
      itemsPerPage: 10
    }
  });
}));

/**
 * PUT /api/admin/moderation/:id
 * Update moderation item status
 */
router.put('/moderation/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!id) {
    throw new ValidationError('Item ID is required');
  }
  
  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    throw new ValidationError('Valid status is required (approved, rejected, pending)');
  }
  
  // Placeholder response - in real app would update database
  res.success({ 
    id, 
    status,
    updatedAt: new Date().toISOString()
  }, 'Moderation status updated successfully');
}));

export default router;