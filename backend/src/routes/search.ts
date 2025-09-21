import { Router, Request, Response } from 'express';
import { ValidationError } from '../types/errors';
import { asyncHandler } from '../middleware/errorHandler';
import DatabaseService from '../services/database';

const router = Router();

/**
 * GET /api/search
 * Full-text search across curricula with advanced filtering
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const query = req.query.q as string;
  if (!query || query.trim().length === 0) {
    throw new ValidationError('Search query is required');
  }
  
  // Parse pagination parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;
  
  // Build search conditions
  const searchTerm = query.trim();
  const searchConditions = {
    OR: [
      { name: { contains: searchTerm, mode: 'insensitive' as const } },
      { publisher: { contains: searchTerm, mode: 'insensitive' as const } },
      { description: { contains: searchTerm, mode: 'insensitive' as const } },
      { teachingApproachStyle: { contains: searchTerm, mode: 'insensitive' as const } },
      { teachingApproachDescription: { contains: searchTerm, mode: 'insensitive' as const } },
      { instructionStyleType: { contains: searchTerm, mode: 'insensitive' as const } },
      { strengths: { has: searchTerm } },
      { bestFor: { has: searchTerm } },
      {
        curriculumSubjects: {
          some: {
            subject: {
              name: { contains: searchTerm, mode: 'insensitive' as const }
            }
          }
        }
      }
    ]
  };
  
  // Additional filters with enhanced filtering capabilities
  const where: any = { ...searchConditions };
  
  // Filter by grade level (support multiple grade levels)
  if (req.query.gradeLevel) {
    const gradeLevels = Array.isArray(req.query.gradeLevel) 
      ? req.query.gradeLevel 
      : [req.query.gradeLevel];
    
    where.gradeLevelId = {
      in: gradeLevels
    };
  }
  
  // Filter by subjects (enhanced to support multiple subjects)
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
  
  // Filter by teaching approach (support multiple approaches)
  if (req.query.teachingApproach) {
    const approaches = Array.isArray(req.query.teachingApproach) 
      ? req.query.teachingApproach 
      : [req.query.teachingApproach];
    
    where.teachingApproachStyle = {
      in: approaches
    };
  }
  
  // Filter by cost range (support multiple ranges)
  if (req.query.costRange) {
    const costRanges = Array.isArray(req.query.costRange) 
      ? req.query.costRange 
      : [req.query.costRange];
    
    where.costPriceRange = {
      in: costRanges
    };
  }
  
  // Filter by rating range
  if (req.query.minRating || req.query.maxRating) {
    const ratingFilter: any = {};
    
    if (req.query.minRating) {
      const minRating = parseFloat(req.query.minRating as string);
      if (!isNaN(minRating)) {
        ratingFilter.gte = minRating;
      }
    }
    
    if (req.query.maxRating) {
      const maxRating = parseFloat(req.query.maxRating as string);
      if (!isNaN(maxRating)) {
        ratingFilter.lte = maxRating;
      }
    }
    
    if (Object.keys(ratingFilter).length > 0) {
      where.overallRating = ratingFilter;
    }
  }
  
  // Filter by availability options
  if (req.query.availability) {
    const availabilityOptions = Array.isArray(req.query.availability) 
      ? req.query.availability 
      : [req.query.availability];
    
    const availabilityConditions = [];
    
    if (availabilityOptions.includes('inPrint')) {
      availabilityConditions.push({ availabilityInPrint: true });
    }
    if (availabilityOptions.includes('digital')) {
      availabilityConditions.push({ availabilityDigital: true });
    }
    if (availabilityOptions.includes('usedMarket')) {
      availabilityConditions.push({ availabilityUsedMarket: true });
    }
    
    if (availabilityConditions.length > 0) {
      where.OR = where.OR ? [...where.OR, ...availabilityConditions] : availabilityConditions;
    }
  }
  
  // Enhanced sorting options with popularity and relevance
  const sortBy = req.query.sortBy as string || 'relevance';
  const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';
  
  const validSortFields = ['name', 'publisher', 'overallRating', 'createdAt', 'popularity', 'cost', 'relevance'];
  
  let orderBy: any;
  
  if (sortBy === 'popularity') {
    // Sort by review count and rating combined
    orderBy = [
      { reviewCount: sortOrder },
      { overallRating: 'desc' }
    ];
  } else if (sortBy === 'cost') {
    // Sort by cost price range (custom ordering)
    orderBy = { costPriceRange: sortOrder };
  } else if (sortBy === 'relevance' && searchTerm) {
    // For relevance, we'll calculate it in the transform step and sort there
    orderBy = [
      { overallRating: 'desc' },
      { reviewCount: 'desc' }
    ];
  } else if (validSortFields.includes(sortBy)) {
    orderBy = { [sortBy]: sortOrder };
  } else {
    orderBy = { overallRating: 'desc' };
  }
  
  // Execute search
  const [results, totalCount] = await Promise.all([
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
  
  // Transform results with enhanced metadata and relevance scoring
  let searchResults = results.map((curriculum: any) => ({
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
    instructionStyle: {
      type: curriculum.instructionStyleType,
      rating: curriculum.instructionStyleRating
    },
    cost: {
      priceRange: curriculum.costPriceRange,
      rating: curriculum.costRating,
      value: curriculum.costValue
    },
    timeCommitment: {
      dailyMinutes: curriculum.timeCommitmentDailyMinutes,
      weeklyHours: curriculum.timeCommitmentWeeklyHours,
      flexibility: curriculum.timeCommitmentFlexibility
    },
    availability: {
      inPrint: curriculum.availabilityInPrint,
      digital: curriculum.availabilityDigital,
      usedMarket: curriculum.availabilityUsedMarket
    },
    overallRating: curriculum.overallRating,
    reviewCount: curriculum.reviewCount,
    strengths: curriculum.strengths?.slice(0, 3) || [], // Limit for search results
    bestFor: curriculum.bestFor?.slice(0, 3) || [], // Limit for search results
    createdAt: curriculum.createdAt,
    // Enhanced relevance score
    relevanceScore: calculateRelevanceScore(curriculum, searchTerm),
    // Popularity score for sorting
    popularityScore: calculatePopularityScore(curriculum)
  }));
  
  // Apply relevance sorting if requested
  if (sortBy === 'relevance' && searchTerm) {
    searchResults = searchResults.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.relevanceScore - a.relevanceScore;
      }
      return a.relevanceScore - b.relevanceScore;
    });
  }
  
  const totalPages = Math.ceil(totalCount / limit);
  
  res.success({
    query: searchTerm,
    results: searchResults,
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
 * GET /api/search/suggestions
 * Get search suggestions based on partial query with enhanced autocomplete
 */
router.get('/suggestions', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.success({ suggestions: [] });
  }
  
  const searchTerm = query.trim();
  const limit = Math.min(10, parseInt(req.query.limit as string) || 8);
  
  // Get curriculum name suggestions with popularity scoring
  const curriculumSuggestions = await prisma.curriculum.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm } },
        { publisher: { contains: searchTerm } }
      ]
    },
    select: {
      id: true,
      name: true,
      publisher: true,
      overallRating: true,
      reviewCount: true
    },
    orderBy: [
      { overallRating: 'desc' },
      { reviewCount: 'desc' }
    ],
    take: Math.ceil(limit * 0.6) // 60% of suggestions from curricula
  });
  
  // Get subject suggestions (with fallback for missing relations)
  let subjectSuggestions: any[] = [];
  try {
    subjectSuggestions = await prisma.subject.findMany({
      where: {
        name: { contains: searchTerm }
      },
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
        curriculumSubjects: {
          _count: 'desc'
        }
      },
      take: Math.ceil(limit * 0.25) // 25% from subjects
    });
  } catch (error) {
    // Fallback if subject table doesn't exist or has issues
    console.warn('Subject suggestions failed, using fallback:', error);
    subjectSuggestions = [];
  }
  
  // Get teaching approach suggestions
  const teachingApproachSuggestions = await prisma.curriculum.findMany({
    where: {
      teachingApproachStyle: { contains: searchTerm }
    },
    select: {
      teachingApproachStyle: true
    },
    distinct: ['teachingApproachStyle'],
    take: Math.ceil(limit * 0.15) // 15% from teaching approaches
  });
  
  // Combine and format suggestions with enhanced metadata
  const suggestions = [
    ...curriculumSuggestions.map(c => ({
      id: c.id,
      type: 'curriculum',
      text: c.name,
      subtitle: c.publisher,
      metadata: {
        rating: c.overallRating,
        reviewCount: c.reviewCount
      }
    })),
    ...subjectSuggestions.map(s => ({
      id: s.id,
      type: 'subject',
      text: s.name,
      subtitle: `Subject • ${s._count?.curriculumSubjects || 0} curricula`,
      metadata: {
        curriculumCount: s._count?.curriculumSubjects || 0
      }
    })),
    ...teachingApproachSuggestions.map(ta => ({
      id: ta.teachingApproachStyle,
      type: 'approach',
      text: ta.teachingApproachStyle,
      subtitle: 'Teaching Approach',
      metadata: {}
    }))
  ].slice(0, limit);
  
  res.success({ suggestions });
}));

/**
 * Calculate enhanced relevance score for search results
 * Uses weighted scoring based on match location and quality
 */
function calculateRelevanceScore(curriculum: any, searchTerm: string): number {
  if (!searchTerm) return 0;
  
  let score = 0;
  const term = searchTerm.toLowerCase();
  const words = term.split(' ').filter(word => word.length > 0);
  
  // Exact name match (highest weight)
  if (curriculum.name.toLowerCase() === term) {
    score += 50;
  } else if (curriculum.name.toLowerCase().includes(term)) {
    score += 25;
  }
  
  // Individual word matches in name
  words.forEach(word => {
    if (curriculum.name.toLowerCase().includes(word)) {
      score += 15;
    }
  });
  
  // Publisher match
  if (curriculum.publisher.toLowerCase().includes(term)) {
    score += 10;
  }
  
  // Description match (weighted by position)
  const descLower = curriculum.description.toLowerCase();
  if (descLower.includes(term)) {
    const position = descLower.indexOf(term);
    // Earlier matches get higher scores
    score += Math.max(8 - Math.floor(position / 50), 2);
  }
  
  // Teaching approach match
  if (curriculum.teachingApproachStyle?.toLowerCase().includes(term)) {
    score += 12;
  }
  
  // Instruction style match
  if (curriculum.instructionStyleType?.toLowerCase().includes(term)) {
    score += 8;
  }
  
  // Subject match (high weight for educational content)
  const hasSubjectMatch = curriculum.curriculumSubjects?.some((cs: any) => 
    cs.subject.name.toLowerCase().includes(term)
  );
  if (hasSubjectMatch) {
    score += 20;
  }
  
  // Strengths and bestFor matches
  const strengthsMatch = curriculum.strengths?.some((strength: string) => 
    strength.toLowerCase().includes(term)
  );
  if (strengthsMatch) {
    score += 6;
  }
  
  const bestForMatch = curriculum.bestFor?.some((bf: string) => 
    bf.toLowerCase().includes(term)
  );
  if (bestForMatch) {
    score += 8;
  }
  
  // Quality boost based on rating and reviews
  const qualityMultiplier = 1 + (curriculum.overallRating || 0) * 0.1;
  const reviewBoost = Math.min(curriculum.reviewCount || 0, 50) * 0.1;
  
  return Math.round((score + reviewBoost) * qualityMultiplier);
}

/**
 * Calculate popularity score based on ratings and review count
 */
function calculatePopularityScore(curriculum: any): number {
  const rating = curriculum.overallRating || 0;
  const reviewCount = curriculum.reviewCount || 0;
  
  // Weighted combination of rating and review count
  // Higher weight on rating, but review count provides volume boost
  const ratingScore = rating * 20; // Max 100 points for 5-star rating
  const volumeScore = Math.min(reviewCount * 2, 50); // Max 50 points for review volume
  
  return Math.round(ratingScore + volumeScore);
}

/**
 * GET /api/search/filters
 * Get dynamic filter counts based on current search and filters
 */
router.get('/filters', asyncHandler(async (req: Request, res: Response) => {
  const prisma = DatabaseService.getInstance();
  
  const query = req.query.q as string;
  let baseWhere: any = {};
  
  // Apply search conditions if query exists
  if (query && query.trim().length > 0) {
    const searchTerm = query.trim();
    baseWhere = {
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' as const } },
        { publisher: { contains: searchTerm, mode: 'insensitive' as const } },
        { description: { contains: searchTerm, mode: 'insensitive' as const } },
        { teachingApproachStyle: { contains: searchTerm, mode: 'insensitive' as const } },
        {
          curriculumSubjects: {
            some: {
              subject: {
                name: { contains: searchTerm, mode: 'insensitive' as const }
              }
            }
          }
        }
      ]
    };
  }
  
  // Get counts for each filter category
  const [
    gradeLevelCounts,
    subjectCounts,
    teachingApproachCounts,
    costRangeCounts,
    availabilityCounts
  ] = await Promise.all([
    // Grade level counts
    prisma.curriculum.groupBy({
      by: ['gradeLevelId'],
      where: baseWhere,
      _count: true,
      orderBy: {
        _count: {
          gradeLevelId: 'desc'
        }
      }
    }).then(async (results) => {
      const gradeLevelIds = results.map(r => r.gradeLevelId).filter(Boolean);
      const gradeLevels = await prisma.gradeLevel.findMany({
        where: { id: { in: gradeLevelIds } },
        select: { id: true, name: true, ageRange: true }
      });
      
      return results.map(result => ({
        id: result.gradeLevelId,
        name: gradeLevels.find(gl => gl.id === result.gradeLevelId)?.name || 'Unknown',
        ageRange: gradeLevels.find(gl => gl.id === result.gradeLevelId)?.ageRange || '',
        count: result._count
      })).filter(item => item.id);
    }),
    
    // Subject counts (with fallback for missing relations)
    prisma.curriculum.findMany({
      where: baseWhere,
      select: {
        curriculumSubjects: {
          select: {
            subject: {
              select: { id: true, name: true }
            }
          }
        }
      }
    }).then(curricula => {
      const subjectCounts = new Map<string, { id: string; name: string; count: number }>();
      
      curricula.forEach(curriculum => {
        if (curriculum.curriculumSubjects) {
          curriculum.curriculumSubjects.forEach(cs => {
            const subject = cs?.subject;
            if (subject) {
              const existing = subjectCounts.get(subject.id);
              if (existing) {
                existing.count++;
              } else {
                subjectCounts.set(subject.id, {
                  id: subject.id,
                  name: subject.name,
                  count: 1
                });
              }
            }
          });
        }
      });
      
      return Array.from(subjectCounts.values()).sort((a, b) => b.count - a.count);
    }).catch(error => {
      console.warn('Subject counts failed, using fallback:', error);
      return [];
    }),
    
    // Teaching approach counts
    prisma.curriculum.groupBy({
      by: ['teachingApproachStyle'],
      where: baseWhere,
      _count: true,
      orderBy: {
        _count: {
          teachingApproachStyle: 'desc'
        }
      }
    }).then(results => 
      results.map(result => ({
        id: result.teachingApproachStyle?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
        name: result.teachingApproachStyle || 'Unknown',
        count: result._count
      })).filter(item => item.name !== 'Unknown')
    ),
    
    // Cost range counts
    prisma.curriculum.groupBy({
      by: ['costPriceRange'],
      where: baseWhere,
      _count: true,
      orderBy: {
        costPriceRange: 'asc'
      }
    }).then(results => 
      results.map(result => ({
        id: result.costPriceRange?.toLowerCase() || 'unknown',
        name: result.costPriceRange || 'Unknown',
        count: result._count
      })).filter(item => item.name !== 'Unknown')
    ),
    
    // Availability counts
    Promise.all([
      prisma.curriculum.count({
        where: { ...baseWhere, availabilityInPrint: true }
      }),
      prisma.curriculum.count({
        where: { ...baseWhere, availabilityDigital: true }
      }),
      prisma.curriculum.count({
        where: { ...baseWhere, availabilityUsedMarket: true }
      })
    ]).then(([inPrint, digital, usedMarket]) => [
      { id: 'inPrint', name: 'In Print', count: inPrint },
      { id: 'digital', name: 'Digital Available', count: digital },
      { id: 'usedMarket', name: 'Used Market', count: usedMarket }
    ])
  ]);
  
  res.success({
    filters: {
      gradeLevels: gradeLevelCounts,
      subjects: subjectCounts,
      teachingApproaches: teachingApproachCounts,
      costRanges: costRangeCounts,
      availability: availabilityCounts
    }
  });
}));

export default router;