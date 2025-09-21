#!/bin/bash

# Quick Start Script - Runs both backend and frontend

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Shelf Taught application...${NC}"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if setup has been run
if [ ! -f backend/.env ] || [ ! -f backend/dist/index.js ]; then
    echo -e "${YELLOW}⚠️  Initial setup required. Running setup...${NC}"
    ./start-local.sh
fi

# Start backend in background
echo -e "${BLUE}🔧 Starting backend server...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend started successfully${NC}"
else
    echo -e "${YELLOW}⏳ Backend starting up...${NC}"
fi

# Start frontend in background
echo -e "${BLUE}🎨 Starting frontend server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

echo ""
echo -e "${GREEN}🎉 Application started successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3001"
echo -e "${BLUE}🏥 Health Check:${NC} http://localhost:3001/health"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and wait for user to stop
wait