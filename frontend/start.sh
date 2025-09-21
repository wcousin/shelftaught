#!/bin/bash

echo "🔧 Starting deployment script..."

# Check if dist directory exists, if not build it
if [ ! -d "dist" ]; then
    echo "📦 Dist directory not found, building..."
    npm run build
else
    echo "✅ Dist directory found"
fi

# List contents for debugging
echo "📂 Current directory contents:"
ls -la

echo "📂 Dist directory contents:"
ls -la dist/ || echo "❌ No dist directory"

# Start the server
echo "🚀 Starting server..."
node server.cjs