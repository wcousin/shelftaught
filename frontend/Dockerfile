FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set environment
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la dist/ && test -f dist/index.html

# Expose port
EXPOSE 3000

# Start production server using our Express server
CMD ["node", "server.cjs"]