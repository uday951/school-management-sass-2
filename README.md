# School Management Multi-Tenant SaaS Platform (Phase 1)

This repository hosts a multi-tenant school management software platform, specifically built for Phase 1. It contains:
- **Platform Owner / Super Admin Console**: To onboard schools (atomic tenant creation), manage school statuses, and inspect audit trails.
- **Strict Tenant Isolation**: Ready-to-go database layout to prevent cross-school data leakages.

---

## Architecture Stack

### Monorepo Workspaces
- `apps/web`: React, Vite, TS, Tailwind CSS, Tanstack Query, React Hook Form, Radix UI.
- `apps/api`: NestJS API, TS, Prisma, MongoDB.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- NPM (v9+)
- Docker (for launching local MongoDB replica-set)

---

### Step 1: Install Dependencies
From the workspace root directory:
```bash
npm install
```

### Step 2: Set Environment Variables
Copy `.env.example` in the root folder to `apps/api/.env` and fill in secrets:
```bash
cp .env.example apps/api/.env
```

### Step 3: Run MongoDB Replica Set (Docker)
Start the local MongoDB replica set required for Prisma transactions:
```bash
docker-compose up -d
```

### Step 4: Setup Database & Generate Client
Generate Prisma SDK client and sync MongoDB database indexes:
```bash
npm run db:generate
npm run db:push
```

### Step 5: Seed Platform Super Admin User
Provision the initial Super Admin account using your environment configuration values:
```bash
npm run seed
```

### Step 6: Start Servers
Run both backend NestJS and frontend Vite development instances concurrently:
```bash
# Run backend development server
npm run dev:api

# Run web frontend development server (Open http://localhost:5173)
npm run dev:web
```

---

## Build and Testing

To typecheck, lint, or compile for production releases:
```bash
# Typecheck TypeScript files
npm run typecheck

# Build apps for production
npm run build:api
npm run build:web
```
