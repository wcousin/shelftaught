import { Router, Request, Response } from 'express';
import { ValidationError, NotFoundError } from '../types/errors';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import DatabaseService from '../services/database';

const router = Router();

/**
 * GET /api/user/saved
 * Get user's saved curricula
 */
router.get('/saved', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const savedCurricula = await prisma.savedCurriculum.findMany({
    where: { userId: req.user!.id },
    include: {
      curriculum: {
        include: {
          gradeLevel: true,
          curriculumSubjects: {
            include: {
              subject: true,
            },
          },
        },
      },
    },
    orderBy: { savedAt: 'desc' },
  });

  // Transform the data to match the expected format
  const formattedSavedCurricula = savedCurricula.map(saved => ({
    id: saved.id,
    personalNotes: saved.personalNotes,
    savedAt: saved.savedAt,
    curriculum: {
      id: saved.curriculum.id,
      name: saved.curriculum.name,
      publisher: saved.curriculum.publisher,
      description: saved.curriculum.description,
      imageUrl: saved.curriculum.imageUrl,
      overallRating: saved.curriculum.overallRating,
      gradeLevel: saved.curriculum.gradeLevel,
      subjects: saved.curriculum.curriculumSubjects.map(cs => cs.subject),
      // Include key rating information for quick reference
      teachingApproachStyle: saved.curriculum.teachingApproachStyle,
      costPriceRange: saved.curriculum.costPriceRange,
      timeCommitmentDailyMinutes: saved.curriculum.timeCommitmentDailyMinutes,
    },
  }));

  res.success({
    savedCurricula: formattedSavedCurricula,
    count: formattedSavedCurricula.length,
  }, 'Saved curricula retrieved successfully');
}));

/**
 * POST /api/user/saved
 * Save a curriculum to user's list
 */
router.post('/saved', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { curriculumId, personalNotes } = req.body;

  // Validate request
  if (!curriculumId || typeof curriculumId !== 'string') {
    throw new ValidationError('Curriculum ID is required');
  }

  if (personalNotes && typeof personalNotes !== 'string') {
    throw new ValidationError('Personal notes must be a string');
  }

  if (personalNotes && personalNotes.length > 1000) {
    throw new ValidationError('Personal notes cannot exceed 1000 characters');
  }

  const prisma = DatabaseService.getInstance();

  // Check if curriculum exists
  const curriculum = await prisma.curriculum.findUnique({
    where: { id: curriculumId },
  });

  if (!curriculum) {
    throw new NotFoundError('Curriculum not found');
  }

  // Check if already saved (upsert behavior)
  const existingSaved = await prisma.savedCurriculum.findUnique({
    where: {
      userId_curriculumId: {
        userId: req.user!.id,
        curriculumId: curriculumId,
      },
    },
  });

  let savedCurriculum;

  if (existingSaved) {
    // Update existing saved curriculum
    savedCurriculum = await prisma.savedCurriculum.update({
      where: { id: existingSaved.id },
      data: {
        personalNotes: personalNotes || null,
      },
      include: {
        curriculum: {
          select: {
            id: true,
            name: true,
            publisher: true,
            overallRating: true,
          },
        },
      },
    });
  } else {
    // Create new saved curriculum
    savedCurriculum = await prisma.savedCurriculum.create({
      data: {
        userId: req.user!.id,
        curriculumId: curriculumId,
        personalNotes: personalNotes || null,
      },
      include: {
        curriculum: {
          select: {
            id: true,
            name: true,
            publisher: true,
            overallRating: true,
          },
        },
      },
    });
  }

  res.success({
    savedCurriculum: {
      id: savedCurriculum.id,
      personalNotes: savedCurriculum.personalNotes,
      savedAt: savedCurriculum.savedAt,
      curriculum: savedCurriculum.curriculum,
    },
  }, existingSaved ? 'Curriculum updated in saved list' : 'Curriculum saved successfully');
}));

/**
 * DELETE /api/user/saved/:id
 * Remove a curriculum from user's saved list
 */
router.delete('/saved/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new ValidationError('Saved curriculum ID is required');
  }

  const prisma = DatabaseService.getInstance();

  // Find the saved curriculum and verify ownership
  const savedCurriculum = await prisma.savedCurriculum.findUnique({
    where: { id },
    include: {
      curriculum: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!savedCurriculum) {
    throw new NotFoundError('Saved curriculum not found');
  }

  // Verify the saved curriculum belongs to the authenticated user
  if (savedCurriculum.userId !== req.user!.id) {
    throw new NotFoundError('Saved curriculum not found');
  }

  // Delete the saved curriculum
  await prisma.savedCurriculum.delete({
    where: { id },
  });

  res.success({
    curriculumName: savedCurriculum.curriculum.name,
  }, 'Curriculum removed from saved list');
}));

export default router;