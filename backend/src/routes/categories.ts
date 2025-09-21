import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import DatabaseService from '../services/database';

const router = Router();

/**
 * GET /api/categories
 * Get all subject categories and grade levels with curriculum counts
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  // Get all subjects with curriculum counts
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          curriculumSubjects: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  // Get all grade levels with curriculum counts
  const gradeLevels = await prisma.gradeLevel.findMany({
    select: {
      id: true,
      name: true,
      ageRange: true,
      minAge: true,
      maxAge: true,
      _count: {
        select: {
          curricula: true
        }
      }
    },
    orderBy: {
      minAge: 'asc'
    }
  });
  
  // Get teaching approaches with counts
  const teachingApproaches = await prisma.curriculum.groupBy({
    by: ['teachingApproachStyle'],
    _count: {
      teachingApproachStyle: true
    },
    orderBy: {
      _count: {
        teachingApproachStyle: 'desc'
      }
    }
  });
  
  // Get cost ranges with counts
  const costRanges = await prisma.curriculum.groupBy({
    by: ['costPriceRange'],
    _count: {
      costPriceRange: true
    },
    orderBy: {
      costPriceRange: 'asc'
    }
  });
  
  // Transform data for response
  const transformedSubjects = subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    description: subject.description,
    curriculumCount: subject._count.curriculumSubjects
  }));
  
  const transformedGradeLevels = gradeLevels.map(gradeLevel => ({
    id: gradeLevel.id,
    name: gradeLevel.name,
    ageRange: gradeLevel.ageRange,
    minAge: gradeLevel.minAge,
    maxAge: gradeLevel.maxAge,
    curriculumCount: gradeLevel._count.curricula
  }));
  
  const transformedTeachingApproaches = teachingApproaches.map(approach => ({
    name: approach.teachingApproachStyle,
    curriculumCount: approach._count.teachingApproachStyle
  }));
  
  const transformedCostRanges = costRanges.map(cost => ({
    range: cost.costPriceRange,
    curriculumCount: cost._count.costPriceRange
  }));
  
  res.success({
    subjects: transformedSubjects,
    gradeLevels: transformedGradeLevels,
    teachingApproaches: transformedTeachingApproaches,
    costRanges: transformedCostRanges
  });
}));

/**
 * GET /api/categories/subjects
 * Get all subjects with curriculum counts
 */
router.get('/subjects', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: {
          curriculumSubjects: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  const transformedSubjects = subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    description: subject.description,
    curriculumCount: subject._count.curriculumSubjects
  }));
  
  res.success({ subjects: transformedSubjects });
}));

/**
 * GET /api/categories/grade-levels
 * Get all grade levels with curriculum counts
 */
router.get('/grade-levels', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const gradeLevels = await prisma.gradeLevel.findMany({
    select: {
      id: true,
      name: true,
      ageRange: true,
      minAge: true,
      maxAge: true,
      _count: {
        select: {
          curricula: true
        }
      }
    },
    orderBy: {
      minAge: 'asc'
    }
  });
  
  const transformedGradeLevels = gradeLevels.map(gradeLevel => ({
    id: gradeLevel.id,
    name: gradeLevel.name,
    ageRange: gradeLevel.ageRange,
    minAge: gradeLevel.minAge,
    maxAge: gradeLevel.maxAge,
    curriculumCount: gradeLevel._count.curricula
  }));
  
  res.success({ gradeLevels: transformedGradeLevels });
}));

/**
 * GET /api/categories/teaching-approaches
 * Get all teaching approaches with curriculum counts
 */
router.get('/teaching-approaches', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const teachingApproaches = await prisma.curriculum.groupBy({
    by: ['teachingApproachStyle'],
    _count: {
      teachingApproachStyle: true
    },
    orderBy: {
      _count: {
        teachingApproachStyle: 'desc'
      }
    }
  });
  
  const transformedTeachingApproaches = teachingApproaches.map(approach => ({
    name: approach.teachingApproachStyle,
    curriculumCount: approach._count.teachingApproachStyle
  }));
  
  res.success({ teachingApproaches: transformedTeachingApproaches });
}));

/**
 * GET /api/categories/cost-ranges
 * Get all cost ranges with curriculum counts
 */
router.get('/cost-ranges', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const costRanges = await prisma.curriculum.groupBy({
    by: ['costPriceRange'],
    _count: {
      costPriceRange: true
    },
    orderBy: {
      costPriceRange: 'asc'
    }
  });
  
  const transformedCostRanges = costRanges.map(cost => ({
    range: cost.costPriceRange,
    curriculumCount: cost._count.costPriceRange
  }));
  
  res.success({ costRanges: transformedCostRanges });
}));

export default router;