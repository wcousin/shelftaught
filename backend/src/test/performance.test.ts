import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import { AuthUtils } from '../utils/auth';

const prisma = new PrismaClient();

describe('Backend Performance Tests', () => {
  let authToken: string;
  let testCurriculaIds: string[] = [];

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

    authToken = AuthUtils.generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    });

    // Create large dataset for performance testing
    const curricula = [];
    for (let i = 0; i < 1000; i++) {
      curricula.push({
        name: `Performance Test Curriculum ${i}`,
        publisher: `Publisher ${i % 10}`,
        description: `Description for performance test curriculum ${i}. This is a longer description to simulate real data.`,
        targetAgeGrade: {
          minAge: 5 + (i % 10),
          maxAge: 15 + (i % 10),
          gradeRange: `K-${5 + (i % 10)}`,
          rating: 3 + (i % 3)
        },
        teachingApproach: {
          style: ['Traditional', 'Charlotte Mason', 'Unit Studies', 'Montessori'][i % 4],
          description: 'Teaching approach description',
          rating: 3 + (i % 3)
        },
        subjectsCovered: {
          subjects: ['Math', 'Science', 'Reading', 'History', 'Art'][i % 5],
          comprehensiveness: 3 + (i % 3),
          rating: 3 + (i % 3)
        },
        materialsIncluded: {
          components: ['Textbook', 'Workbook', 'Videos', 'Online Access'],
          completeness: 4,
          rating: 4
        },
        instructionStyle: {
          type: ['Parent-led', 'Self-directed', 'Video-based'][i % 3],
          supportLevel: 4,
          rating: 4
        },
        timeCommitment: {
          dailyMinutes: 30 + (i % 60),
          weeklyHours: 3 + (i % 5),
          flexibility: 3 + (i % 3),
          rating: 4
        },
        cost: {
          priceRange: ['$', '$$', '$$$', '$$$$'][i % 4],
          value: 3 + (i % 3),
          rating: 4
        },
        strengths: [`Strength ${i}`, `Another strength ${i}`],
        weaknesses: [`Weakness ${i}`],
        bestFor: [`Best for ${i}`, `Also good for ${i}`],
        availability: {
          inPrint: true,
          digitalAvailable: i % 2 === 0,
          usedMarket: true,
          rating: 4
        },
        overallRating: 3 + (i % 3),
        reviewCount: 10 + (i % 20)
      });
    }

    // Batch create curricula
    const batchSize = 100;
    for (let i = 0; i < curricula.length; i += batchSize) {
      const batch = curricula.slice(i, i + batchSize);
      const createdBatch = await prisma.curriculum.createMany({
        data: batch
      });
    }

    // Get created curriculum IDs
    const createdCurricula = await prisma.curriculum.findMany({
      select: { id: true }
    });
    testCurriculaIds = createdCurricula.map(c => c.id);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.savedCurriculum.deleteMany();
    await prisma.curriculum.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Search Performance', () => {
    it('should handle search queries within acceptable time limits', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search?q=math')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
      expect(response.body.success).toBe(true);
      expect(response.body.data.curricula).toBeInstanceOf(Array);
    });

    it('should handle complex search queries efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search?q=traditional+math+elementary&subjects=Math&gradeLevels=Elementary')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(3000); // Complex queries should still be fast
      expect(response.body.success).toBe(true);
    });

    it('should handle pagination efficiently for large result sets', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/search?q=curriculum&page=10&limit=20')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(2000); // Pagination should not significantly slow down queries
      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(10);
    });

    it('should handle concurrent search requests efficiently', async () => {
      const concurrentRequests = 10;
      const promises = [];
      
      const startTime = Date.now();
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(app)
            .get(`/api/search?q=test${i}`)
            .expect(200)
        );
      }
      
      const responses = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(5000); // All concurrent requests should complete within 5 seconds
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Filtering Performance', () => {
    it('should apply multiple filters efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/curricula?subjects=Math,Science&gradeLevels=Elementary&priceRange=$$&teachingApproach=Traditional')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(2000);
      expect(response.body.success).toBe(true);
    });

    it('should handle filter combinations with large datasets', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/curricula?subjects=Math&minRating=4&maxPrice=100&limit=50')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(2500);
      expect(response.body.success).toBe(true);
      expect(response.body.data.curricula.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Database Query Performance', () => {
    it('should retrieve curriculum details efficiently', async () => {
      const curriculumId = testCurriculaIds[0];
      
      const startTime = Date.now();
      
      const response = await request(app)
        .get(`/api/curricula/${curriculumId}`)
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500); // Single record retrieval should be very fast
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(curriculumId);
    });

    it('should handle bulk operations efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/curricula?limit=100')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1500); // Bulk retrieval should be reasonably fast
      expect(response.body.success).toBe(true);
      expect(response.body.data.curricula.length).toBe(100);
    });
  });

  describe('Authentication Performance', () => {
    it('should handle login requests efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000); // Authentication should be fast
      expect(response.body.success).toBe(true);
    });

    it('should handle concurrent authentication requests', async () => {
      const concurrentLogins = 5;
      const promises = [];
      
      const startTime = Date.now();
      
      for (let i = 0; i < concurrentLogins; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'testpassword'
            })
            .expect(200)
        );
      }
      
      const responses = await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(3000); // Concurrent auth should complete within 3 seconds
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('User Data Performance', () => {
    it('should handle saved curricula operations efficiently', async () => {
      const curriculumId = testCurriculaIds[0];
      
      // Save curriculum
      const saveStartTime = Date.now();
      
      const saveResponse = await request(app)
        .post('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ curriculumId })
        .expect(201);
      
      const saveEndTime = Date.now();
      const saveTime = saveEndTime - saveStartTime;
      
      expect(saveTime).toBeLessThan(1000);
      expect(saveResponse.body.success).toBe(true);
      
      // Retrieve saved curricula
      const retrieveStartTime = Date.now();
      
      const retrieveResponse = await request(app)
        .get('/api/user/saved')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      const retrieveEndTime = Date.now();
      const retrieveTime = retrieveEndTime - retrieveStartTime;
      
      expect(retrieveTime).toBeLessThan(1000);
      expect(retrieveResponse.body.success).toBe(true);
      expect(retrieveResponse.body.data.length).toBeGreaterThan(0);
    });

    it('should handle bulk saved curricula operations', async () => {
      // Save multiple curricula
      const curriculaToSave = testCurriculaIds.slice(1, 11); // Save 10 curricula
      
      const startTime = Date.now();
      
      const promises = curriculaToSave.map(curriculumId =>
        request(app)
          .post('/api/user/saved')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ curriculumId })
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(5000); // Bulk operations should complete within 5 seconds
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should handle large response payloads efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/curricula?limit=500') // Large payload
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(3000);
      expect(response.body.success).toBe(true);
      expect(response.body.data.curricula.length).toBe(500);
      
      // Check response size is reasonable
      const responseSize = JSON.stringify(response.body).length;
      expect(responseSize).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should handle stress testing with multiple concurrent operations', async () => {
      const operations = [];
      
      // Mix of different operations
      for (let i = 0; i < 20; i++) {
        operations.push(
          request(app).get('/api/curricula?limit=10'),
          request(app).get(`/api/search?q=test${i}`),
          request(app).get('/api/categories')
        );
      }
      
      const startTime = Date.now();
      
      const responses = await Promise.all(operations);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(10000); // All operations should complete within 10 seconds
      
      // All responses should be successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should apply rate limiting without significantly impacting performance', async () => {
      const requests = [];
      
      // Make requests up to but not exceeding rate limit
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .get('/api/curricula?limit=5')
            .expect(200)
        );
      }
      
      const startTime = Date.now();
      
      const responses = await Promise.all(requests);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(5000);
      
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle invalid requests efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/curricula/invalid-id')
        .expect(404);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500); // Error responses should be fast
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed requests without performance degradation', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send('invalid json')
        .expect(400);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(500);
      expect(response.body.success).toBe(false);
    });
  });
});