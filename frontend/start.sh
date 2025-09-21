#!/bin/bash

echo "🔧 Starting deployment script..."

# Set NODE_ENV if not set
export NODE_ENV=${NODE_ENV:-production}
echo "🔍 NODE_ENV: $NODE_ENV"
echo "🌐 PORT: ${PORT:-3000}"

# Always build to ensure we have the latest code
echo "📦 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory doesn't exist"
    exit 1
fi

# List contents for debugging
echo "📂 Current directory contents:"
ls -la

echo "📂 Dist directory contents:"
ls -la dist/ || echo "❌ No dist directory"

# Verify index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "❌ index.html not found in dist directory"
    exit 1
fi

echo "✅ Build successful, starting server..."

# Start the server
echo "🚀 Starting server on port ${PORT:-3000}..."
exec node server.cjs