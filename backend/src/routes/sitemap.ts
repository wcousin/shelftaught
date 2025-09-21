import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import DatabaseService from '../services/database';
import { Logger } from '../utils/logger';

const router = express.Router();

// Generate XML sitemap
router.get('/sitemap.xml', asyncHandler(async (req: express.Request, res: express.Response) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://shelftaught.com';
    
    // Get all curricula for sitemap
    const prisma = DatabaseService.getInstance();
    const curricula = await prisma.curriculum.findMany({
      select: {
        id: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/browse', priority: '0.9', changefreq: 'daily' },
      { url: '/search', priority: '0.8', changefreq: 'weekly' },
      { url: '/login', priority: '0.3', changefreq: 'monthly' },
      { url: '/register', priority: '0.3', changefreq: 'monthly' }
    ];

    // Generate XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add curriculum pages
    curricula.forEach((curriculum: any) => {
      const lastmod = new Date(curriculum.updatedAt).toISOString().split('T')[0];
      sitemap += `
  <url>
    <loc>${baseUrl}/curriculum/${curriculum.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
    });
    
    res.send(sitemap);
    
    Logger.info(`Generated sitemap with ${curricula.length} curriculum pages`);
  } catch (error) {
    Logger.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}));

// Generate robots.txt
router.get('/robots.txt', (req: express.Request, res: express.Response) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://shelftaught.com';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1`;

  res.set({
    'Content-Type': 'text/plain',
    'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
  });
  
  res.send(robotsTxt);
});

export default router;