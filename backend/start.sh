#!/bin/bash

echo "🔧 Starting backend deployment script..."

# Set NODE_ENV if not set
export NODE_ENV=${NODE_ENV:-production}
echo "🔍 NODE_ENV: $NODE_ENV"

# Check if dist directory exists, if not build it
if [ ! -d "dist" ]; then
    echo "📦 Dist directory not found, building TypeScript..."
    
    # Generate Prisma client
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    
    # Build TypeScript
    echo "🔨 Building TypeScript..."
    npm run build
    
    # Check if build was successful
    if [ ! -d "dist" ]; then
        echo "❌ Build failed - dist directory still doesn't exist"
        exit 1
    fi
    
    # Run database migrations
    echo "🗄️ Running database migrations..."
    npx prisma migrate deploy
else
    echo "✅ Dist directory found"
fi

# List contents for debugging
echo "📂 Current directory contents:"
ls -la

echo "📂 Dist directory contents:"
ls -la dist/ || echo "❌ No dist directory"

# Verify index.js exists
if [ ! -f "dist/index.js" ]; then
    echo "❌ index.js not found in dist directory"
    exit 1
fi

# Start the server
echo "🚀 Starting backend server..."
node dist/index.js