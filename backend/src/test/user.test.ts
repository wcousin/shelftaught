import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import DatabaseService from '../services/database';
import { errorHandler } from '../middleware/errorHandler';
import { responseHelpers } from '../utils/response';
import authRoutes from '../routes/auth';
import userRoutes from '../routes/user';
import { AuthUtils } from '../utils/auth';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(responseHelpers);
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use(errorHandler);
  return app;
};

describe('User Routes', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let testUser: any;
  let authToken: string;
  let testCurriculum: any;

  beforeAll(async () => {
    app = createTestApp();
    prisma = DatabaseService.getInstance();
    
    // Clean up any existing test data
    await prisma.savedCurriculum.deleteMany({
      where: { user: { email: { contains: 'test' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } },
    });
  });

  beforeEach(async () => {
    // Create test user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'testpass123',
        firstName: 'Test',
        lastName: 'User',
      });

    testUser = registerResponse.body.data.user;
    authToken = registerResponse.body.data.token;

    // Create test curriculum
    testCurriculum = await prisma.curriculum.create({
      data: {
        name: 'Test Curriculum',
        publisher: 'Test Publisher',
        description: 'A test curriculum for testing purposes',
        gradeLevelId: (await prisma.gradeLevel.findFirst())!.id,
        teachingApproachStyle: 'Traditional',
        teachingApproachDescription: 'Traditional approach',
        instructionStyleType: 'Parent-led',
        costPriceRange: '$',
        overallRating: 4.5,
      },
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.savedCurriculum.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.curriculum.deleteMany({
      where: { name: 'Test Curriculum' },
    });
    await prisma.user.deleteMany({
      where: { email: 'testuser@example.com' },
    });
  });

  describe('GET /api/user/saved', () => {
    it('should return empty list when user has no saved curricula', async () => {
      const response = await request(app)
        .get('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedCurricula).toEqual([]);
      expect(response.body.data.count).toBe(0);
    });

    it('should return saved curricula when user has saved items', async () => {
      // Save a curriculum first
      await prisma.savedCurriculum.create({
        data: {
          userId: testUser.id,
          curriculumId: testCurriculum.id,
          personalNotes: 'Great for my child',
        },
      });

      const response = await request(app)
        .get('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedCurricula).toHaveLength(1);
      expect(response.body.data.count).toBe(1);
      expect(response.body.data.savedCurricula[0].personalNotes).toBe('Great for my child');
      expect(response.body.data.savedCurricula[0].curriculum.name).toBe('Test Curriculum');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/user/saved')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/user/saved')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/user/saved', () => {
    it('should save a curriculum successfully', async () => {
      const response = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          curriculumId: testCurriculum.id,
          personalNotes: 'Looks interesting for next year',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedCurriculum.personalNotes).toBe('Looks interesting for next year');
      expect(response.body.data.savedCurriculum.curriculum.name).toBe('Test Curriculum');

      // Verify in database
      const savedInDb = await prisma.savedCurriculum.findFirst({
        where: {
          userId: testUser.id,
          curriculumId: testCurriculum.id,
        },
      });
      expect(savedInDb).toBeTruthy();
    });

    it('should save curriculum without personal notes', async () => {
      const response = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          curriculumId: testCurriculum.id,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedCurriculum.personalNotes).toBeNull();
    });

    it('should update existing saved curriculum', async () => {
      // Save curriculum first
      await prisma.savedCurriculum.create({
        data: {
          userId: testUser.id,
          curriculumId: testCurriculum.id,
          personalNotes: 'Original note',
        },
      });

      const response = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          curriculumId: testCurriculum.id,
          personalNotes: 'Updated note',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.savedCurriculum.personalNotes).toBe('Updated note');
      expect(response.body.message).toContain('updated');
    });

    it('should reject missing curriculum ID', async () => {
      const response = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          personalNotes: 'Some notes',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Curriculum ID is required');
    });

    it('should reject non-existent curriculum', async () => {
      const response = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          curriculumId: 'non-existent-id',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Curriculum not found');
    });

    it('should reject personal notes that are too long', async () => {
      const longNotes = 'a'.repeat(1001); // Exceeds 1000 character limit

      const response = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          curriculumId: testCurriculum.id,
          personalNotes: longNotes,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('cannot exceed 1000 characters');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/user/saved')
        .send({
          curriculumId: testCurriculum.id,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/user/saved/:id', () => {
    let savedCurriculumId: string;

    beforeEach(async () => {
      const savedCurriculum = await prisma.savedCurriculum.create({
        data: {
          userId: testUser.id,
          curriculumId: testCurriculum.id,
          personalNotes: 'To be deleted',
        },
      });
      savedCurriculumId = savedCurriculum.id;
    });

    it('should delete saved curriculum successfully', async () => {
      const response = await request(app)
        .delete(`/api/user/saved/${savedCurriculumId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.curriculumName).toBe('Test Curriculum');

      // Verify deletion in database
      const deletedItem = await prisma.savedCurriculum.findUnique({
        where: { id: savedCurriculumId },
      });
      expect(deletedItem).toBeNull();
    });

    it('should return 404 for non-existent saved curriculum', async () => {
      const response = await request(app)
        .delete('/api/user/saved/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');
    });

    it('should not allow deleting another user\'s saved curriculum', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'testpass123',
          firstName: 'Other',
          lastName: 'User',
        });

      const otherUserToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .delete(`/api/user/saved/${savedCurriculumId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not found');

      // Verify the saved curriculum still exists
      const stillExists = await prisma.savedCurriculum.findUnique({
        where: { id: savedCurriculumId },
      });
      expect(stillExists).toBeTruthy();

      // Clean up other user
      await prisma.user.delete({
        where: { email: 'otheruser@example.com' },
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/user/saved/${savedCurriculumId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Authentication Integration Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = createTestApp();
    prisma = DatabaseService.getInstance();
  });

  beforeEach(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { contains: 'authtest' } },
    });
  });

  afterEach(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { contains: 'authtest' } },
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'authtest@example.com',
        password: 'testpass123',
        firstName: 'Auth',
        lastName: 'Test',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.user.role).toBe('USER');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'authtest@example.com',
        password: 'testpass123',
        firstName: 'Auth',
        lastName: 'Test',
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123', // Too weak
          firstName: '', // Empty
          lastName: 'Test',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'authtest@example.com',
          password: 'testpass123',
          firstName: 'Auth',
          lastName: 'Test',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'authtest@example.com',
          password: 'testpass123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('authtest@example.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpass123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'authtest@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '', // Empty email
          password: 'testpass123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and get token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'authtest@example.com',
          password: 'testpass123',
          firstName: 'Auth',
          lastName: 'Test',
        });
      
      authToken = response.body.data.token;
    });

    it('should return current user info with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('authtest@example.com');
      expect(response.body.data.user.firstName).toBe('Auth');
      expect(response.body.data.user.lastName).toBe('Test');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});