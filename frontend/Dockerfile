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

# Verify build output
RUN ls -la dist/ && echo "Build verification complete"

# Install serve globally to serve static files
RUN npm install -g serve

# Create a startup script with debugging
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Starting frontend application..."' >> /start.sh && \
    echo 'echo "📂 Working directory: $(pwd)"' >> /start.sh && \
    echo 'echo "🌐 PORT: ${PORT:-3000}"' >> /start.sh && \
    echo 'echo "📁 Dist contents:"' >> /start.sh && \
    echo 'ls -la dist/' >> /start.sh && \
    echo 'echo "🔧 Starting serve on 0.0.0.0:${PORT:-3000}"' >> /start.sh && \
    echo 'exec serve -s dist -l 0.0.0.0:${PORT:-3000}' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 3000

# Start the application with debugging
CMD ["/start.sh"]