import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/admin';
import { errorHandler } from '../middleware/errorHandler';
import { responseHelpers } from '../utils/response';

// Mock the entire auth middleware to bypass authentication for testing
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: 'admin-id', role: 'ADMIN' };
    next();
  },
  requireAdmin: (req: any, res: any, next: any) => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }
    next();
  },
}));

// Mock the database service
jest.mock('../services/database', () => ({
  getInstance: jest.fn(() => ({
    curriculum: {
      count: jest.fn().mockResolvedValue(10),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _avg: {} }),
    },
    user: {
      count: jest.fn().mockResolvedValue(5),
    },
    savedCurriculum: {
      count: jest.fn().mockResolvedValue(15),
    },
    subject: {
      count: jest.fn().mockResolvedValue(8),
      findMany: jest.fn().mockResolvedValue([]),
    },
    gradeLevel: {
      count: jest.fn().mockResolvedValue(6),
      findMany: jest.fn().mockResolvedValue([]),
    },
  })),
}));

const app = express();
app.use(express.json());
app.use(responseHelpers);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);

describe('Admin Routes - Integration Tests', () => {
  describe('GET /api/admin/analytics', () => {
    it('should return analytics data for admin users', async () => {
      const response = await request(app)
        .get('/api/admin/analytics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.overview).toBeDefined();
      expect(response.body.data.analytics.overview.totalCurricula).toBe(10);
    });
  });

  describe('POST /api/admin/curricula', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/admin/curricula')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });
  });

  describe('PUT /api/admin/curricula/:id', () => {
    it('should require curriculum ID', async () => {
      const response = await request(app)
        .put('/api/admin/curricula/')
        .send({ name: 'Test' });

      expect(response.status).toBe(404); // Route not found
    });
  });

  describe('DELETE /api/admin/curricula/:id', () => {
    it('should require curriculum ID', async () => {
      const response = await request(app)
        .delete('/api/admin/curricula/')
        .send();

      expect(response.status).toBe(404); // Route not found
    });
  });
});