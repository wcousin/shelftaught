# Production Deployment Guide

This guide covers the complete production deployment setup for Shelf Taught, including Docker containers, SSL certificates, monitoring, and automated backups.

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured (optional for local deployment)
- SSL certificates (can be generated automatically)
- Minimum 2GB RAM, 20GB storage

## Quick Start

1. **Clone and prepare the repository:**
   ```bash
   git clone <repository-url>
   cd shelftaught
   ```

2. **Run the production setup script:**
   ```bash
   ./scripts/setup-production.sh
   ```

3. **Follow the prompts to configure your environment**

## Manual Setup

### 1. Environment Configuration

Copy the production environment template:
```bash
cp .env.production .env
```

Edit `.env` with your production values:
```bash
# Required changes
POSTGRES_PASSWORD=your_secure_database_password
JWT_SECRET=your_super_secure_jwt_secret_key_at_least_32_characters
CORS_ORIGIN=https://yourdomain.com
DOMAIN=yourdomain.com
```

### 2. SSL Certificates

#### Option A: Self-signed certificates (development/testing)
```bash
./scripts/generate-ssl.sh
```

#### Option B: Let's Encrypt certificates (production)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

### 3. Build and Deploy

Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

Start services:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Database Setup

Run migrations:
```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

Seed database (optional):
```bash
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

## Monitoring and Health Checks

### Health Check Endpoints

- **Basic health:** `GET /health`
- **Detailed health:** `GET /health/detailed`
- **Readiness probe:** `GET /ready`
- **Liveness probe:** `GET /live`

### Log Files

Logs are stored in the `logs/` directory:
- `combined.log` - All application logs
- `error.log` - Error logs only
- `audit.log` - Security and audit events
- `performance.log` - Performance metrics
- `security.log` - Security events

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# View application logs
tail -f logs/combined.log
tail -f logs/error.log
```

## Backup and Recovery

### Automated Backups

Backups are configured to run daily at 2 AM by default. The backup service:
- Creates compressed PostgreSQL dumps
- Retains backups for 30 days (configurable)
- Verifies backup integrity
- Logs backup operations

### Manual Backup

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec backup /backup.sh

# List available backups
./scripts/restore.sh --list
```

### Restore from Backup

```bash
# Restore specific backup
./scripts/restore.sh shelftaught_backup_20231220_120000.sql

# Force restore with database cleanup
./scripts/restore.sh --force --clean shelftaught_backup_20231220_120000.sql
```

## Security Configuration

### SSL/TLS

- TLS 1.2 and 1.3 only
- Strong cipher suites
- HSTS headers
- Automatic HTTP to HTTPS redirect

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting

- API endpoints: 10 requests/second
- Login endpoints: 1 request/second
- Configurable burst limits

### Input Validation

- Request size limits (10MB)
- Content-Type validation
- XSS protection
- SQL injection prevention

## Performance Optimization

### Caching

- Redis for session storage and caching
- Nginx static file caching
- API response caching headers

### Database

- Connection pooling
- Query optimization
- Index optimization
- Regular maintenance

### Frontend

- Gzip compression
- Static asset caching
- Lazy loading
- Code splitting

## Maintenance

### Regular Tasks

1. **Monitor disk space:**
   ```bash
   df -h
   docker system df
   ```

2. **Clean up old Docker images:**
   ```bash
   docker system prune -a
   ```

3. **Update SSL certificates:**
   ```bash
   sudo certbot renew
   ```

4. **Monitor logs for errors:**
   ```bash
   grep -i error logs/combined.log
   ```

### Updates and Deployments

1. **Pull latest changes:**
   ```bash
   git pull origin main
   ```

2. **Rebuild and deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run database migrations:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

## Troubleshooting

### Common Issues

1. **Service won't start:**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs service-name
   
   # Check service status
   docker-compose -f docker-compose.prod.yml ps
   ```

2. **Database connection issues:**
   ```bash
   # Check database health
   curl http://localhost/health
   
   # Connect to database directly
   docker-compose -f docker-compose.prod.yml exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
   ```

3. **SSL certificate issues:**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Test SSL connection
   openssl s_client -connect yourdomain.com:443
   ```

4. **High memory usage:**
   ```bash
   # Check container memory usage
   docker stats
   
   # Check application logs
   grep -i "memory" logs/combined.log
   ```

### Emergency Procedures

1. **Service outage:**
   ```bash
   # Restart all services
   docker-compose -f docker-compose.prod.yml restart
   
   # Or restart specific service
   docker-compose -f docker-compose.prod.yml restart backend
   ```

2. **Database corruption:**
   ```bash
   # Restore from latest backup
   ./scripts/restore.sh --force --clean $(ls -t backups/shelftaught_backup_*.sql | head -1)
   ```

3. **Security incident:**
   ```bash
   # Check security logs
   grep -i "security" logs/security.log
   
   # Block suspicious IPs (update nginx config)
   # Rotate JWT secrets
   # Force user re-authentication
   ```

## Monitoring and Alerting

### Key Metrics to Monitor

- Response times (< 2 seconds for search)
- Error rates (< 1%)
- Memory usage (< 80%)
- Disk usage (< 85%)
- Database connection pool
- SSL certificate expiry

### Recommended Monitoring Tools

- **Application Performance:** New Relic, DataDog, or Prometheus
- **Infrastructure:** Grafana, Zabbix, or CloudWatch
- **Log Analysis:** ELK Stack, Splunk, or Fluentd
- **Uptime Monitoring:** Pingdom, UptimeRobot, or StatusCake

### Alert Thresholds

- Response time > 5 seconds
- Error rate > 5%
- Memory usage > 90%
- Disk usage > 90%
- Failed backups
- SSL certificate expiry < 30 days

## Scaling Considerations

### Horizontal Scaling

- Load balancer (Nginx, HAProxy, or cloud LB)
- Multiple backend instances
- Database read replicas
- CDN for static assets

### Vertical Scaling

- Increase container resources
- Optimize database queries
- Implement caching strategies
- Database connection pooling

## Support and Documentation

- Application logs: `logs/` directory
- Health checks: `/health` endpoints
- Backup status: `backups/` directory
- Configuration: `.env` file
- SSL certificates: `ssl/` directory

For additional support, check the application logs and health endpoints for detailed error information.