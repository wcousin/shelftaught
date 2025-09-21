#!/bin/bash

# Production Setup Script for Shelf Taught

set -e

echo "🚀 Setting up Shelf Taught for production..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ssl
mkdir -p backups
mkdir -p logs
mkdir -p nginx

# Set proper permissions
chmod 755 ssl backups logs nginx
chmod +x scripts/*.sh

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.production .env
    echo "⚠️  Please edit .env file with your production values before continuing!"
    echo "   Required changes:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - CORS_ORIGIN"
    echo "   - Domain and SSL certificate paths"
    read -p "Press Enter after updating .env file..."
fi

# Validate required environment variables
source .env

required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "CORS_ORIGIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set in .env"
        exit 1
    fi
done

# Generate SSL certificates if they don't exist
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo "🔐 SSL certificates not found. Generating self-signed certificates..."
    echo "⚠️  For production, replace these with proper SSL certificates from a CA!"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=${DOMAIN:-localhost}"
    
    chmod 600 ssl/key.pem
    chmod 644 ssl/cert.pem
fi

# Build production images
echo "🏗️  Building production Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

# Seed database if needed
read -p "Do you want to seed the database with sample data? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Seeding database..."
    docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db seed
fi

# Start services
echo "🚀 Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    echo "❌ Some services are unhealthy. Check logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

echo "✅ Production setup complete!"
echo ""
echo "🌐 Your application should be available at:"
echo "   HTTP:  http://${DOMAIN:-localhost}"
echo "   HTTPS: https://${DOMAIN:-localhost}"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
echo "📋 Next steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Replace self-signed SSL certificates with proper ones"
echo "   3. Set up monitoring and alerting"
echo "   4. Configure automated backups"