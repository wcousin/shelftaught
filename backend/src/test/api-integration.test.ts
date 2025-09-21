import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import { AuthUtils } from '../utils/auth';

const prisma = new PrismaClient();

describe('API Integration Tests', () => {
  let authToken: string;
  let adminToken: string;
  let testUserId: string;
  let testCurriculumId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.savedCurriculum.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const hashedPassword = await AuthUtils.hashPassword('testpassword');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'USER'
      }
    });
    testUserId = testUser.id;

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });

    // Generate tokens
    authToken = AuthUtils.generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    });

    adminToken = AuthUtils.generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role
    });

    // Create test curriculum
    const testCurriculum = await prisma.curriculum.create({
      data: {
        name: 'Test Curriculum',
        publisher: 'Test Publisher',
        description: 'A test curriculum for integration testing',
        gradeLevelId: 'test-grade-level-id',
        targetAgeGradeRating: 4,
        teachingApproach: {
          style: 'Traditional',
          description: 'Traditional teaching approach',
          rating: 4
        },
        subjectsCovered: {
          subjects: ['Math', 'Reading'],
          comprehensiveness: 4,
          rating: 4
        },
        materialsIncluded: {
          components: ['Textbook', 'Workbook'],
          completeness: 4,
          rating: 4
        },
        instructionStyle: {
          type: 'Parent-led',
          supportLevel: 4,
          rating: 4
        },
        timeCommitment: {
          dailyMinutes: 60,
          weeklyHours: 5,
          flexibility: 3,
          rating: 4
        },
        cost: {
          priceRange: '$$',
          value: 4,
          rating: 4
        },
        strengths: ['Comprehensive', 'Well-structured'],
        weaknesses: ['Time-intensive'],
        bestFor: ['Traditional learners'],
        availability: {
          inPrint: true,
          digitalAvailable: true,
          usedMarket: true,
          rating: 5
        },
        overallRating: 4.2,
        reviewCount: 1
      }
    });
    testCurriculumId = testCurriculum.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.savedCurriculum.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@example.com',
            password: 'password123'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('newuser@example.com');
        expect(response.body.data.token).toBeDefined();
      });

      it('should reject registration with invalid email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: 'invalid-email',
            password: 'password123'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject registration with duplicate email', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123'
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.message).toContain('already exists');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'testpassword'
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.user.email).toBe('test@example.com');
        expect(response.body.data.token).toBeDefined();
      });

      it('should reject login with invalid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should reject login with non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'password123'
          });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Curriculum Endpoints', () => {
    describe('GET /api/curricula', () => {
      it('should return curricula list', async () => {
        const response = await request(app)
          .get('/api/curricula');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.curricula).toBeInstanceOf(Array);
        expect(response.body.data.curricula.length).toBeGreaterThan(0);
      });

      it('should filter curricula by subject', async () => {
        const response = await request(app)
          .get('/api/curricula?subjects=Math');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.curricula).toBeInstanceOf(Array);
      });

      it('should paginate results', async () => {
        const response = await request(app)
          .get('/api/curricula?page=1&limit=5');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.page).toBe(1);
        expect(response.body.data.curricula.length).toBeLessThanOrEqual(5);
      });
    });

    describe('GET /api/curricula/:id', () => {
      it('should return curriculum details', async () => {
        const response = await request(app)
          .get(`/api/curricula/${testCurriculumId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testCurriculumId);
        expect(response.body.data.name).toBe('Test Curriculum');
      });

      it('should return 404 for non-existent curriculum', async () => {
        const response = await request(app)
          .get('/api/curricula/non-existent-id');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Search Endpoints', () => {
    describe('GET /api/search', () => {
      it('should search curricula by query', async () => {
        const response = await request(app)
          .get('/api/search?q=Test');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.curricula).toBeInstanceOf(Array);
      });

      it('should return empty results for non-matching query', async () => {
        const response = await request(app)
          .get('/api/search?q=NonExistentCurriculum');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.curricula).toHaveLength(0);
      });
    });
  });

  describe('User Endpoints', () => {
    describe('GET /api/user/saved', () => {
      it('should require authentication', async () => {
        const response = await request(app)
          .get('/api/user/saved');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should return user saved curricula', async () => {
        const response = await request(app)
          .get('/api/user/saved')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/user/saved', () => {
      it('should save curriculum for authenticated user', async () => {
        const response = await request(app)
          .post('/api/user/saved')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            curriculumId: testCurriculumId,
            personalNotes: 'Great curriculum for my child'
          });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.curriculumId).toBe(testCurriculumId);
      });

      it('should prevent duplicate saves', async () => {
        // Try to save the same curriculum again
        const response = await request(app)
          .post('/api/user/saved')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            curriculumId: testCurriculumId
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/user/saved/:id', () => {
      it('should remove saved curriculum', async () => {
        // First get the saved curriculum ID
        const savedResponse = await request(app)
          .get('/api/user/saved')
          .set('Authorization', `Bearer ${authToken}`);

        const savedCurriculumId = savedResponse.body.data[0].id;

        const response = await request(app)
          .delete(`/api/user/saved/${savedCurriculumId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Admin Endpoints', () => {
    describe('POST /api/admin/curricula', () => {
      it('should require admin role', async () => {
        const response = await request(app)
          .post('/api/admin/curricula')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: 'New Curriculum',
            publisher: 'New Publisher'
          });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      it('should create curriculum with admin role', async () => {
        const curriculumData = {
          name: 'Admin Created Curriculum',
          publisher: 'Admin Publisher',
          description: 'Created by admin',
          targetAgeGrade: {
            minAge: 5,
            maxAge: 10,
            gradeRange: 'K-5',
            rating: 4
          },
          teachingApproach: {
            style: 'Unit Studies',
            description: 'Unit studies approach',
            rating: 4
          },
          subjectsCovered: {
            subjects: ['Science'],
            comprehensiveness: 4,
            rating: 4
          },
          materialsIncluded: {
            components: ['Textbook'],
            completeness: 4,
            rating: 4
          },
          instructionStyle: {
            type: 'Self-directed',
            supportLevel: 3,
            rating: 4
          },
          timeCommitment: {
            dailyMinutes: 45,
            weeklyHours: 4,
            flexibility: 4,
            rating: 4
          },
          cost: {
            priceRange: '$',
            value: 5,
            rating: 4
          },
          strengths: ['Affordable'],
          weaknesses: ['Limited scope'],
          bestFor: ['Independent learners'],
          availability: {
            inPrint: true,
            digitalAvailable: false,
            usedMarket: true,
            rating: 4
          }
        };

        const response = await request(app)
          .post('/api/admin/curricula')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(curriculumData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Admin Created Curriculum');
      });
    });

    describe('PUT /api/admin/curricula/:id', () => {
      it('should update curriculum with admin role', async () => {
        const response = await request(app)
          .put(`/api/admin/curricula/${testCurriculumId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Updated Test Curriculum',
            description: 'Updated description'
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Updated Test Curriculum');
      });
    });

    describe('GET /api/admin/analytics', () => {
      it('should return analytics for admin', async () => {
        const response = await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalCurricula');
        expect(response.body.data).toHaveProperty('totalUsers');
      });

      it('should deny access to non-admin users', async () => {
        const response = await request(app)
          .get('/api/admin/analytics')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Categories Endpoints', () => {
    describe('GET /api/categories', () => {
      it('should return subjects and grade levels', async () => {
        const response = await request(app)
          .get('/api/categories');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('subjects');
        expect(response.body.data).toHaveProperty('gradeLevels');
        expect(response.body.data.subjects).toBeInstanceOf(Array);
        expect(response.body.data.gradeLevels).toBeInstanceOf(Array);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test'
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid authorization header', async () => {
      const response = await request(app)
        .get('/api/user/saved')
        .set('Authorization', 'Invalid Bearer Token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const promises = Array(20).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});