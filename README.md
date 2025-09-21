# Shelf Taught - Homeschool Curriculum Review Website

A comprehensive platform for homeschooling parents to discover and evaluate educational curricula through detailed reviews and ratings.

## Project Structure

```
shelftaught/
├── frontend/          # React TypeScript frontend with Vite
├── backend/           # Express.js TypeScript backend
├── docker-compose.yml # Development environment setup
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Development Setup

1. **Clone and install dependencies:**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

2. **Start development environment with Docker:**
```bash
# Start PostgreSQL, backend, and frontend
docker-compose up
```

3. **Or run locally:**
```bash
# Start PostgreSQL (if not using Docker)
# Update DATABASE_URL in backend/.env

# Generate Prisma client and run migrations
cd backend
npm run db:generate
npm run db:migrate

# Start backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

#### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Testing:** Vitest (frontend), Jest (backend)
- **Code Quality:** ESLint, Prettier
- **Deployment:** Docker

## Environment Variables

Copy `.env.example` to `.env` in the backend directory and update values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/shelftaught?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

## API Endpoints

- `GET /health` - Health check
- `GET /api` - API status
- More endpoints will be added as development progresses

## Contributing

1. Follow the existing code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed

## License

MIT