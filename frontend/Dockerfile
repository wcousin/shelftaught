# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Install serve globally to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]