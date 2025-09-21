import request from 'supertest';
import express from 'express';
import sitemapRoutes from '../routes/sitemap';

// Mock DatabaseService
jest.mock('../services/database', () => ({
  getInstance: () => ({
    curriculum: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'test-id-1', updatedAt: new Date('2023-01-01') },
        { id: 'test-id-2', updatedAt: new Date('2023-01-02') }
      ])
    }
  })
}));

// Create test app
const app = express();
app.use('/', sitemapRoutes);

describe('Sitemap Routes', () => {
  describe('GET /sitemap.xml', () => {
    it('should return XML sitemap with correct content type', async () => {
      const response = await request(app)
        .get('/sitemap.xml')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/xml');
      expect(response.text).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(response.text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(response.text).toContain('</urlset>');
    });

    it('should include static pages in sitemap', async () => {
      const response = await request(app)
        .get('/sitemap.xml')
        .expect(200);

      expect(response.text).toContain('<loc>https://shelftaught.com</loc>');
      expect(response.text).toContain('<loc>https://shelftaught.com/browse</loc>');
      expect(response.text).toContain('<loc>https://shelftaught.com/search</loc>');
    });

    it('should set appropriate cache headers', async () => {
      const response = await request(app)
        .get('/sitemap.xml')
        .expect(200);

      expect(response.headers['cache-control']).toBe('public, max-age=3600');
    });
  });

  describe('GET /robots.txt', () => {
    it('should return robots.txt with correct content type', async () => {
      const response = await request(app)
        .get('/robots.txt')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toContain('User-agent: *');
      expect(response.text).toContain('Allow: /');
      expect(response.text).toContain('Sitemap: https://shelftaught.com/sitemap.xml');
    });

    it('should set appropriate cache headers', async () => {
      const response = await request(app)
        .get('/robots.txt')
        .expect(200);

      expect(response.headers['cache-control']).toBe('public, max-age=86400');
    });
  });
});