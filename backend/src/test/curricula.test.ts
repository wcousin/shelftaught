import request from 'supertest';
import express from 'express';
import DatabaseService from '../services/database';
import curriculaRoutes from '../routes/curricula';
import searchRoutes from '../routes/search';
import categoriesRoutes from '../routes/categories';
import { errorHandler } from '../middleware/errorHandler';
import { responseHelpers } from '../utils/response';

// Create test app
const app = express();
app.use(express.json());
app.use(responseHelpers);
app.use('/api/curricula', curriculaRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/categories', categoriesRoutes);
app.use(errorHandler);

// Mock DatabaseService
jest.mock('../services/database');

const mockPrisma = {
  curriculum: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  subject: {
    findMany: jest.fn(),
  },
  gradeLevel: {
    findMany: jest.fn(),
  },
};

const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>;
mockDatabaseService.getInstance.mockReturnValue(mockPrisma as any);

describe('Curriculum API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/curricula', () => {
    const mockCurricula = [
      {
        id: '1',
        name: 'Logic of English',
        publisher: 'Logic of English Inc.',
        description: 'Comprehensive phonics and spelling program',
        imageUrl: 'https://example.com/image.jpg',
        gradeLevelId: 'grade1',
        targetAgeGradeRating: 5,
        teachingApproachStyle: 'Structured Literacy',
        teachingApproachRating: 5,
        costPriceRange: '$$',
        costRating: 4,
        overallRating: 4.5,
        reviewCount: 10,
        createdAt: new Date(),
        gradeLevel: {
          id: 'grade1',
          name: 'Elementary (K-5)',
          ageRange: '5-11 years'
        },
        curriculumSubjects: [
          {
            subject: {
              id: 'subject1',
              name: 'Language Arts'
            }
          }
        ]
      }
    ];

    it('should return curricula with default pagination', async () => {
      mockPrisma.curriculum.findMany.mockResolvedValue(mockCurricula);
      mockPrisma.curriculum.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/curricula')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.curricula).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
      expect(response.body.data.pagination.totalCount).toBe(1);
    });

    it('should handle search functionality', async () => {
      mockPrisma.curriculum.findMany.mockResolvedValue(mockCurricula);
      mockPrisma.curriculum.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/curricula?search=Logic')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.curricula).toHaveLength(1);
      expect(mockPrisma.curriculum.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array)
          })
        })
      );
    });
  });

  describe('GET /api/curricula/:id', () => {
    const mockDetailedCurriculum = {
      id: '1',
      name: 'Logic of English',
      publisher: 'Logic of English Inc.',
      description: 'Comprehensive phonics and spelling program',
      imageUrl: 'https://example.com/image.jpg',
      gradeLevelId: 'grade1',
      targetAgeGradeRating: 5,
      teachingApproachStyle: 'Structured Literacy',
      teachingApproachDescription: 'Systematic approach to reading',
      teachingApproachRating: 5,
      subjectComprehensiveness: 4,
      subjectsCoveredRating: 4,
      materialsComponents: ['Workbook', 'Teacher Manual'],
      materialsCompleteness: 5,
      materialsIncludedRating: 5,
      instructionStyleType: 'Parent-led',
      instructionSupportLevel: 4,
      instructionStyleRating: 4,
      timeCommitmentDailyMinutes: 30,
      timeCommitmentWeeklyHours: 2.5,
      timeCommitmentFlexibility: 3,
      timeCommitmentRating: 4,
      costPriceRange: '$$',
      costValue: 4,
      costRating: 4,
      strengths: ['Comprehensive', 'Well-structured'],
      weaknesses: ['Time-intensive'],
      bestFor: ['Struggling readers', 'Systematic learners'],
      availabilityInPrint: true,
      availabilityDigital: false,
      availabilityUsedMarket: true,
      availabilityRating: 4,
      overallRating: 4.5,
      reviewCount: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      gradeLevel: {
        id: 'grade1',
        name: 'Elementary (K-5)',
        ageRange: '5-11 years',
        minAge: 5,
        maxAge: 11
      },
      curriculumSubjects: [
        {
          subject: {
            id: 'subject1',
            name: 'Language Arts',
            description: 'Reading, writing, and language skills'
          }
        }
      ]
    };

    it('should return detailed curriculum information', async () => {
      mockPrisma.curriculum.findUnique.mockResolvedValue(mockDetailedCurriculum);

      const response = await request(app)
        .get('/api/curricula/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.curriculum.id).toBe('1');
      expect(response.body.data.curriculum.name).toBe('Logic of English');
      expect(response.body.data.curriculum.targetAgeGrade).toBeDefined();
      expect(response.body.data.curriculum.teachingApproach).toBeDefined();
      expect(response.body.data.curriculum.subjectsCovered).toBeDefined();
    });

    it('should return 404 for non-existent curriculum', async () => {
      mockPrisma.curriculum.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curricula/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Curriculum not found');
    });
  });

  describe('GET /api/search', () => {
    const mockSearchResults = [
      {
        id: '1',
        name: 'Logic of English',
        publisher: 'Logic of English Inc.',
        description: 'Comprehensive phonics program',
        imageUrl: null,
        teachingApproachStyle: 'Structured Literacy',
        teachingApproachRating: 5,
        costPriceRange: '$$',
        costRating: 4,
        overallRating: 4.5,
        reviewCount: 10,
        gradeLevel: {
          id: 'grade1',
          name: 'Elementary',
          ageRange: '5-11'
        },
        curriculumSubjects: [
          {
            subject: {
              id: 'subject1',
              name: 'Language Arts'
            }
          }
        ]
      }
    ];

    it('should perform full-text search', async () => {
      mockPrisma.curriculum.findMany.mockResolvedValue(mockSearchResults);
      mockPrisma.curriculum.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/search?q=Logic')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.query).toBe('Logic');
      expect(response.body.data.results).toHaveLength(1);
      expect(response.body.data.results[0].relevanceScore).toBeDefined();
    });

    it('should return 400 for empty search query', async () => {
      const response = await request(app)
        .get('/api/search?q=')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Search query is required');
    });

    it('should return search suggestions', async () => {
      const mockCurriculumSuggestions = [
        { 
          id: '1',
          name: 'Logic of English', 
          publisher: 'Logic of English Inc.',
          overallRating: 4.5,
          reviewCount: 10
        }
      ];
      const mockSubjectSuggestions = [
        { 
          id: 'lang-arts',
          name: 'Language Arts',
          _count: { curriculumSubjects: 0 }
        }
      ];
      const mockTeachingApproachSuggestions = [
        { teachingApproachStyle: 'Traditional' }
      ];

      mockPrisma.curriculum.findMany
        .mockResolvedValueOnce(mockCurriculumSuggestions) // First call for curricula
        .mockResolvedValueOnce(mockTeachingApproachSuggestions); // Second call for teaching approaches
      mockPrisma.subject.findMany.mockResolvedValue(mockSubjectSuggestions);

      const response = await request(app)
        .get('/api/search/suggestions?q=Log')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toHaveLength(3); // Updated to expect 3 suggestions
      expect(response.body.data.suggestions[0].type).toBe('curriculum');
      expect(response.body.data.suggestions[1].type).toBe('subject');
      expect(response.body.data.suggestions[2].type).toBe('approach');
    });
  });

  describe('GET /api/categories', () => {
    const mockSubjects = [
      {
        id: 'subject1',
        name: 'Language Arts',
        description: 'Reading and writing skills',
        _count: { curriculumSubjects: 5 }
      }
    ];

    const mockGradeLevels = [
      {
        id: 'grade1',
        name: 'Elementary',
        ageRange: '5-11 years',
        minAge: 5,
        maxAge: 11,
        _count: { curricula: 10 }
      }
    ];

    const mockTeachingApproaches = [
      {
        teachingApproachStyle: 'Charlotte Mason',
        _count: { teachingApproachStyle: 3 }
      }
    ];

    const mockCostRanges = [
      {
        costPriceRange: '$$',
        _count: { costPriceRange: 8 }
      }
    ];

    it('should return all categories', async () => {
      mockPrisma.subject.findMany.mockResolvedValue(mockSubjects);
      mockPrisma.gradeLevel.findMany.mockResolvedValue(mockGradeLevels);
      mockPrisma.curriculum.groupBy
        .mockResolvedValueOnce(mockTeachingApproaches)
        .mockResolvedValueOnce(mockCostRanges);

      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(1);
      expect(response.body.data.gradeLevels).toHaveLength(1);
      expect(response.body.data.teachingApproaches).toHaveLength(1);
      expect(response.body.data.costRanges).toHaveLength(1);
    });

    it('should return subjects only', async () => {
      mockPrisma.subject.findMany.mockResolvedValue(mockSubjects);

      const response = await request(app)
        .get('/api/categories/subjects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(1);
      expect(response.body.data.subjects[0].curriculumCount).toBe(5);
    });
  });
});