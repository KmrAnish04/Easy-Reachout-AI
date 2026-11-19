# Easy Reachout AI

Your personal job hunt organizer with AI-powered assistance.

## Prerequisites

- **Node.js** 20.9 or higher ([Download](https://nodejs.org/))
- **pnpm** 8.0 or higher (Install: `npm install -g pnpm`)
- **Docker** (Optional, for local PostgreSQL database)

Verify your installations:
```bash
node --version  # Should be >= 20.9.0
pnpm --version  # Should be >= 8.0.0
docker --version
```

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd EasyReachOut-AI
pnpm install
```

### 2. Environment Configuration

Copy the example environment files:
```bash
# Backend environment (Prisma needs this in apps/api directory)
cp .env.example apps/api/.env

# Frontend environment (optional - uses localhost:3001 by default)
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/api/.env` and configure your database:

**Option A: Local Docker Compose (Recommended for development)**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/easyreachout?schema=public"
```

**Option B: Supabase PostgreSQL**
```env
# Get from: Supabase Dashboard > Project Settings > Database > Connection String
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

Copy the output and add it to your `.env`:
```env
JWT_SECRET=<your-generated-secret>
```

### 3. Start Database

**Option A: Local Docker Compose**
```bash
pnpm db:up
```

**Option B: Supabase**
1. Create a project at [supabase.com](https://supabase.com/)
2. Get connection strings from Project Settings > Database
3. Use the pooled connection for `DATABASE_URL`
4. Use the direct connection for `DIRECT_URL` (migrations only)

### 4. Run Migrations

```bash
pnpm db:migrate
```

### 5. Start Development Servers

```bash
# First time: build the API
pnpm --filter api build

# Then start all services
pnpm dev
```

This starts all services in parallel:
- **API Server**: http://localhost:3001
- **Web Client**: http://localhost:3000
- **Shared Package**: Watch mode for changes

## Available Scripts

### Development

- `pnpm dev` - Start all development servers in parallel
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### Database Management

- `pnpm db:up` - Start PostgreSQL in Docker
- `pnpm db:down` - Stop PostgreSQL container
- `pnpm db:migrate` - Run Prisma migrations
- `pnpm db:studio` - Open Prisma Studio (database GUI)

### Package-Specific Commands

```bash
# API only
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api test

# Web only
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint

# Shared package only
pnpm --filter shared dev
pnpm --filter shared build
```

## Project Structure

```
EasyReachOut-AI/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   ├── prisma/       # Database schema
│   │   └── package.json
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # App Router pages
│       │   └── lib/      # Utilities
│       └── package.json
├── packages/
│   └── shared/           # Shared TypeScript code
│       ├── src/
│       └── package.json
├── .env.example          # Backend environment template
├── docker-compose.yml    # PostgreSQL database
└── pnpm-workspace.yaml   # Monorepo configuration
```

## Expected URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Prisma Studio**: Run `pnpm db:studio` (usually http://localhost:5555)

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:
- Verify the API is running on port 3001
- Check that `NEXT_PUBLIC_API_URL` in `apps/web/.env.local` is set to `http://localhost:3001`
- Ensure the backend CORS configuration allows `http://localhost:3000`

### Database Connection Issues

**Error: "P1001: Can't reach database server"**
- Verify PostgreSQL is running: `docker ps` (should show `easyreachout_postgres`)
- Start the database: `pnpm db:up`
- Check DATABASE_URL in `.env` matches your setup

**Error: "Environment variable not found: DATABASE_URL"**
- Ensure `.env` file exists in the workspace root
- Copy from template: `cp .env.example .env`
- Add your database connection string

### Missing Environment Variables

**Error: "Environment variable not found: DATABASE_URL"**
- Ensure `.env` file exists in `apps/api/` directory (not workspace root)
- Copy from template: `cp .env.example apps/api/.env`
- Prisma looks for .env in the same directory as prisma/schema.prisma

**Error: "Environment validation failed"**
- Check `apps/api/.env` has all required variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`
- Verify JWT_SECRET is at least 32 characters long
- Generate a new secret: `openssl rand -base64 32`

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::3001"**
- Another process is using port 3001 or 3000
- Find and kill the process:
  ```bash
  # Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  
  # macOS/Linux
  lsof -ti:3001 | xargs kill -9
  ```

### Prisma Client Not Generated

**Error: "@prisma/client did not initialize yet"**
- Generate the Prisma client: `pnpm --filter api prisma:generate`
- Rebuild the API: `pnpm --filter api build`

### TypeScript Errors in Shared Package

**Error: "Cannot find module '@easy-reachout-ai/shared'"**
- Build the shared package first: `pnpm --filter shared build`
- Or run in watch mode: `pnpm --filter shared dev`

## Supabase Setup (Alternative to Docker)

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com/) and create an account
   - Create a new project and choose a region

2. **Get Connection Strings**
   - Navigate to: Project Settings > Database > Connection String
   - Copy the "URI" connection string (Transaction mode with pooling)
   - Replace `[YOUR-PASSWORD]` with your database password

3. **Configure Environment Variables**
   ```env
   # Pooled connection for runtime (port 6543)
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   
   # Direct connection for migrations (port 5432)
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

4. **Update Prisma Schema** (if using DIRECT_URL)
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

5. **Run Migrations**
   ```bash
   pnpm db:migrate
   ```

## Contributing

This is Milestone 1 - Project Setup. The foundation is complete with:
- ✅ Monorepo structure with pnpm workspaces
- ✅ NestJS backend with health check endpoint
- ✅ Next.js frontend with Tailwind CSS v4
- ✅ Prisma ORM with PostgreSQL
- ✅ Docker Compose for local development
- ✅ Full-stack health check integration

## License

[Add your license here]
