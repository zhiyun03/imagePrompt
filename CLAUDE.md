# CLAUDE.md 已从版本控制中移除

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 全局规则
我会用中文给你指令，你需要用中文回复

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
- `bun run db:generate` - Generate database types using Prisma

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
- `packages/auth/` - Authentication utilities (NextAuth.js)
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
- **Authentication:** NextAuth.js with GitHub OAuth
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** Zustand
- **Data Fetching:** tRPC with React Query
- **Payments:** Stripe integration
- **Email:** Resend with React Email templates
- **Internationalization:** Multi-language support (en, zh, ko, ja)

### App Routing Structure
The app uses Next.js 14 App Router with route groups:

```
src/app/[lang]/
├── (marketing)/    # Public marketing pages (home, blog, pricing)
├── (auth)/         # Authentication pages (login, register)
├── (dashboard)/    # Protected dashboard pages
├── (tools)/        # Public AI tools (image-to-prompt)
├── (docs)/         # Documentation pages
└── (editor)/       # Editor interface
```

**Route Access:**
- **Public:** Tools, marketing, docs, login, register (no auth required)
- **Protected:** Dashboard, admin (requires authentication)
- **Admin:** Admin dashboard (requires admin email in `ADMIN_EMAIL`)

### Database Setup
1. Copy `.env.example` to `.env.local`
2. Set up PostgreSQL database (local or Vercel Postgres)
3. Add `POSTGRES_URL` to `.env.local`
4. Run `bun run db:push` to initialize database schema

**Database Approach:**
- **Schema Management:** Prisma for schema definition and migrations
- **Query Building:** Kysely for type-safe SQL queries
- **Generator:** `prisma-kysely` generates Kysely types from Prisma schema
- **Development Fallback:** Mock database when `POSTGRES_URL` not configured

### Environment Variables
Key environment variables that need to be configured:

**Authentication:**
- `NEXTAUTH_URL` and `NEXTAUTH_SECRET` - NextAuth.js configuration
- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `ADMIN_EMAIL` - Comma-separated admin emails (e.g., "admin@example.com,root@example.com")

**Database & Services:**
- `POSTGRES_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `RESEND_API_KEY` and `RESEND_FROM` - Email sending
- `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` - Payment processing

**Analytics (Optional):**
- `NEXT_PUBLIC_POSTHOG_*` - PostHog analytics

### Internationalization
- **Supported Locales:** English (`en`), Chinese (`zh`), Korean (`ko`), Japanese (`ja`)
- **Default Locale:** Chinese (`zh`)
- **URL Structure:** `/{lang}/{route}` (e.g., `/zh/tools/image-to-prompt`)
- **Locale Detection:** Browser-based with fallback to default

### Authentication Flow
- **Provider:** GitHub OAuth (primary), email provider available
- **Session Strategy:** JWT-based with database sessions
- **Route Protection:** Middleware with `withAuth()` for protected routes
- **Admin Access:** Controlled by `ADMIN_EMAIL` environment variable
- **Public Tools:** AI tools accessible without authentication

### Admin Dashboard
- **Access:** `/admin/dashboard`
- **Requirements:** Admin email configured in `ADMIN_EMAIL`
- **Login:** Separate admin login at `/admin/login`
- **Status:** Alpha stage with static pages

### Code Quality
- TypeScript for type safety
- ESLint with custom configurations
- Prettier for code formatting
- Husky for Git hooks
- Turbo for build orchestration and caching