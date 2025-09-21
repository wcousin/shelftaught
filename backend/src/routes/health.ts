import { Router } from 'express';
import { getHealthMetrics, checkDatabaseHealth } from '../middleware/monitoring.js';
import { Logger } from '../utils/logger.js';

const router = Router();

// Basic health check endpoint
router.get('/health', async (req, res) => {
  try {
    const metrics = getHealthMetrics();
    const dbHealthy = await checkDatabaseHealth();
    
    const health = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      version: metrics.version,
      environment: metrics.environment,
      services: {
        database: dbHealthy ? 'up' : 'down',
        memory: metrics.memory.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'high',
      }
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
    
  } catch (error) {
    Logger.errorWithStack(error as Error, { endpoint: '/health' });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Detailed health check for monitoring systems
router.get('/health/detailed', async (req, res) => {
  try {
    const metrics = getHealthMetrics();
    const dbHealthy = await checkDatabaseHealth();
    
    const detailedHealth = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: metrics.uptime,
      version: metrics.version,
      environment: metrics.environment,
      memory: {
        heapUsed: Math.round(metrics.memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(metrics.memory.heapTotal / 1024 / 1024),
        external: Math.round(metrics.memory.external / 1024 / 1024),
        rss: Math.round(metrics.memory.rss / 1024 / 1024),
      },
      services: {
        database: {
          status: dbHealthy ? 'up' : 'down',
          lastCheck: new Date().toISOString(),
        },
        memory: {
          status: metrics.memory.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'high',
          usage: `${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB`,
        },
      },
      checks: {
        database: dbHealthy,
        memory: metrics.memory.heapUsed < 500 * 1024 * 1024,
        uptime: metrics.uptime > 0,
      }
    };

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);
    
  } catch (error) {
    Logger.errorWithStack(error as Error, { endpoint: '/health/detailed' });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    
    if (dbHealthy) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'database unavailable' });
    }
  } catch (error) {
    Logger.errorWithStack(error as Error, { endpoint: '/ready' });
    res.status(503).json({ status: 'not ready', reason: 'readiness check failed' });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;