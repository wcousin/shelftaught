#!/bin/bash

# Local Development Setup Script (No Docker Required)

set -e

echo "🚀 Starting Shelf Taught locally..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create a simple .env file for local development
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}📝 Creating local environment file...${NC}"
    cat > backend/.env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-for-development-only
CORS_ORIGIN=http://localhost:5173
EOF
    echo -e "${GREEN}✅ Environment file created${NC}"
fi

# Setup SQLite database for local development
echo -e "${BLUE}🗄️  Setting up local database...${NC}"
cd backend

# Use local schema for SQLite
if [ -f "prisma/schema.local.prisma" ]; then
    echo "Using SQLite schema for local development..."
    cp prisma/schema.prisma prisma/schema.postgres.backup
    cp prisma/schema.local.prisma prisma/schema.prisma
fi

# Generate Prisma client
npx prisma generate

# Create database file if it doesn't exist
touch dev.db

# Push schema to database (for SQLite)
npx prisma db push

# Seed database with sample data
npx prisma db seed || echo "Seeding skipped (may not be compatible with SQLite)"

cd ..

echo -e "${GREEN}✅ Database setup complete${NC}"

# Build backend
echo -e "${BLUE}🏗️  Building backend...${NC}"
cd backend
npm run build
cd ..

echo -e "${GREEN}✅ Backend built successfully${NC}"

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo ""
echo -e "${BLUE}1. Start the backend:${NC}"
echo "   cd backend && npm run dev"
echo ""
echo -e "${BLUE}2. In a new terminal, start the frontend:${NC}"
echo "   cd frontend && npm run dev"
echo ""
echo -e "${BLUE}3. Open your browser to:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo "   Health Check: http://localhost:3001/health"
echo ""
echo -e "${YELLOW}Or use the quick start script:${NC}"
echo "   ./quick-start.sh"