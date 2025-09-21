#!/bin/bash

echo "🚀 Starting Railway deployment..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Seed database if needed
echo "🌱 Seeding database..."
npx prisma db seed || echo "Seeding skipped (database may already be seeded)"

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the server
echo "🎯 Starting server..."
npm start