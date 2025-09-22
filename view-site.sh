#!/bin/bash

# Simple script to view the frontend with mock data

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Starting Shelf Taught Frontend...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"

# Start frontend development server
echo -e "${BLUE}🚀 Starting development server...${NC}"
echo ""
echo -e "${GREEN}✨ Shelf Taught will be available at: http://localhost:5173${NC}"
echo -e "${GREEN}🌐 Production site: https://frontend-new-production-96a4.up.railway.app/${NC}"
echo ""
echo -e "${YELLOW}📝 Features available:${NC}"
echo "   • Browse curriculum reviews and ratings"
echo "   • Search and filter curricula"
echo "   • View detailed curriculum information"
echo "   • User authentication and saved curricula"
echo "   • Admin panel for content management"
echo "   • Responsive design for mobile and desktop"
echo ""
echo -e "${BLUE}ℹ️  Connected to production backend API${NC}"
echo -e "${BLUE}   Real data and authentication available${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

cd frontend
npm run dev