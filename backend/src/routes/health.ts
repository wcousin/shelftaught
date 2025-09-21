import { Router } from 'express';

const router = Router();

// Basic health check endpoint
router.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  res.status(200).json(health);
});

// Simple liveness probe
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;