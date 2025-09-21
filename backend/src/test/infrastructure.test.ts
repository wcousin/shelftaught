import request from 'supertest';
import express from 'express';
import { apiLimiter, authLimiter, searchLimiter } from '../middleware/rateLimiter';
import { sanitizeInput, xssProtection } from '../middleware/sanitization';
import { responseHelpers, ResponseUtils } from '../utils/response';
import Environment from '../config/environment';

describe('API Infrastructure', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(sanitizeInput);
    app.use(xssProtection);
    app.use(responseHelpers);
    
    // Add basic error handler for tests
    app.use((error: any, req: any, res: any, next: any) => {
      res.status(500).json({ error: error.message });
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment configuration', () => {
      const config = Environment.getConfig();
      expect(config).toBeDefined();
      expect(config.port).toBeDefined();
      expect(config.nodeEnv).toBeDefined();
      expect(config.databaseUrl).toBeDefined();
      expect(config.jwtSecret).toBeDefined();
    });

    it('should detect test environment', () => {
      expect(Environment.isDevelopment()).toBe(false);
      expect(Environment.isProduction()).toBe(false);
      expect(Environment.isTest()).toBe(true);
    });
  });

  describe('Response Utilities', () => {
    it('should create success response', (done) => {
      // Create a simple test app without middleware that might interfere
      const testApp = express();
      testApp.use(responseHelpers);
      
      testApp.get('/test-success', (req, res) => {
        res.success({ message: 'test' }, 'Success message');
      });

      request(testApp)
        .get('/test-success')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.message).toBe('test');
          expect(res.body.message).toBe('Success message');
          expect(res.body.timestamp).toBeDefined();
        })
        .end(done);
    });

    it('should create created response', (done) => {
      const testApp = express();
      testApp.use(responseHelpers);
      
      testApp.post('/test-created', (req, res) => {
        res.created({ id: 1 }, 'Resource created');
      });

      request(testApp)
        .post('/test-created')
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(1);
          expect(res.body.message).toBe('Resource created');
        })
        .end(done);
    });

    it('should create paginated response', (done) => {
      const testApp = express();
      testApp.use(responseHelpers);
      
      testApp.get('/test-paginated', (req, res) => {
        const data = [{ id: 1 }, { id: 2 }];
        res.paginated(data, 1, 10, 25, 'Paginated results');
      });

      request(testApp)
        .get('/test-paginated')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(2);
          expect(res.body.pagination).toEqual({
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          });
        })
        .end(done);
    });
  });

  describe('Input Sanitization', () => {
    it('should have sanitization middleware available', () => {
      expect(sanitizeInput).toBeDefined();
      expect(xssProtection).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should apply general API rate limiting', (done) => {
      const testApp = express();
      testApp.use(apiLimiter);
      testApp.get('/test', (req, res) => {
        res.json({ success: true });
      });

      request(testApp)
        .get('/test')
        .expect(200)
        .expect((res) => {
          expect(res.headers['ratelimit-limit']).toBeDefined();
          expect(res.headers['ratelimit-remaining']).toBeDefined();
        })
        .end(done);
    });

    it('should apply auth rate limiting', (done) => {
      const testApp = express();
      testApp.use(authLimiter);
      testApp.post('/auth/login', (req, res) => {
        res.json({ success: true });
      });

      request(testApp)
        .post('/auth/login')
        .expect(200)
        .expect((res) => {
          expect(res.headers['ratelimit-limit']).toBeDefined();
          expect(res.headers['ratelimit-remaining']).toBeDefined();
        })
        .end(done);
    });

    it('should apply search rate limiting', (done) => {
      const testApp = express();
      testApp.use(searchLimiter);
      testApp.get('/search', (req, res) => {
        res.json({ success: true });
      });

      request(testApp)
        .get('/search')
        .expect(200)
        .expect((res) => {
          expect(res.headers['ratelimit-limit']).toBeDefined();
          expect(res.headers['ratelimit-remaining']).toBeDefined();
        })
        .end(done);
    });
  });

  describe('ResponseUtils Static Methods', () => {
    let mockRes: any;

    beforeEach(() => {
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
      };
    });

    it('should create success response with ResponseUtils', () => {
      ResponseUtils.success(mockRes, { test: 'data' }, 'Success');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { test: 'data' },
          message: 'Success',
          timestamp: expect.any(String),
        })
      );
    });

    it('should create created response with ResponseUtils', () => {
      ResponseUtils.created(mockRes, { id: 1 }, 'Created');
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { id: 1 },
          message: 'Created',
        })
      );
    });

    it('should create no content response', () => {
      ResponseUtils.noContent(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should create paginated response with ResponseUtils', () => {
      const data = [{ id: 1 }, { id: 2 }];
      ResponseUtils.paginated(mockRes, data, 2, 5, 20, 'Paginated');
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          message: 'Paginated',
          pagination: {
            page: 2,
            limit: 5,
            total: 20,
            totalPages: 4,
          },
        })
      );
    });
  });
});