# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `bun run dev:web` - Start development server for web app (Next.js on localhost:3000)
- `bun run dev` - Start all development servers in parallel
- `bun run build` - Build all packages and apps using Turbo
- `bun run typecheck` - Run TypeScript type checking across all packages
- `bun run lint` - Run ESLint across all packages
- `bun run lint:fix` - Fix ESLint issues automatically
- `bun run format` - Check code formatting with Prettier
- `bun run format:fix` - Fix code formatting automatically

### Database Operations
- `bun run db:push` - Push database schema changes to PostgreSQL (requires database setup first)

### Package Management
- Uses Bun as package manager (`bun install`, `bun add`, etc.)
- Workspace monorepo structure with apps/, packages/, and tooling/ directories

## Project Architecture

### Monorepo Structure
This is a Turbo monorepo with the following main components:

**Apps:**
- `apps/nextjs/` - Main Next.js 14 application (SaaS web app)
- `apps/auth-proxy/` - Authentication proxy service

**Packages:**
- `packages/db/` - Database layer using Kysely and Prisma (PostgreSQL)
- `packages/auth/` - Authentication utilities (currently using Clerk)
- `packages/api/` - Shared API utilities and tRPC setup
- `packages/ui/` - Shared React components (shadcn/ui based)
- `packages/common/` - Shared utilities and types
- `packages/stripe/` - Stripe integration for payments

**Tooling:**
- `tooling/eslint-config/` - Shared ESLint configurations
- `tooling/prettier-config/` - Shared Prettier configuration
- `tooling/tailwind-config/` - Shared Tailwind CSS configuration
- `tooling/typescript-config/` - Shared TypeScript configuration

### Key Technologies
- **Framework:** Next.js 14 with App Router
- **Database:** PostgreSQL with Kysely (type-safe query builder) and Prisma (schema management)
- **Authentication:** Clerk (default after June 2025, NextAuth.js available on separate branch)
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** Zustand
- **Data Fetching:** tRPC with React Query
- **Payments:** Stripe integration
- **Email:** Resend with React Email templates
- **Internationalization:** Built-in i18n support

### Database Setup
1. Copy `.env.example` to `.env.local`
2. Set up PostgreSQL database (local or Vercel Postgres)
3. Add `POSTGRES_URL` to `.env.local`
4. Run `bun run db:push` to initialize database schema

### Environment Variables
Key environment variables that need to be configured:
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` - Clerk authentication
- `POSTGRES_URL` - Database connection
- `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` - Payment processing
- `RESEND_API_KEY` and `RESEND_FROM` - Email sending
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` - GitHub OAuth

### Admin Dashboard
- Access at `/admin/dashboard`
- Configure admin emails via `ADMIN_EMAIL` environment variable
- Currently in alpha stage with static pages

### Code Quality
- TypeScript for type safety
- ESLint with custom configurations
- Prettier for code formatting
- Husky for Git hooks
- Turbo for build orchestration and caching