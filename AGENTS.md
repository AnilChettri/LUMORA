# AGENTS.md - SoulSync Development Guide

## Project Overview
- **Stack**: React 18 + TypeScript + Vite + Express + Drizzle ORM + PostgreSQL + Tailwind CSS
- **Structure**: Single package, client in `client/`, server in `server/`
- **Entry**: Dev runs via `server/index.ts` (Express), client served by Vite

## Essential Commands

```bash
npm run dev          # Start dev server (Express + Vite hot reload)
npm run build        # Production build (verify build.ts exists first)
npm run start        # Run production build
npm run check        # TypeScript type checking (tsc)
npm run lint         # Runs tsc --noEmit (same as check!)
npm run test         # Run Vitest tests
npm run test:ui      # Interactive test UI
npm run db:push      # Push Drizzle migrations to DB
npm run db:generate # Generate Drizzle migrations
```

## Required Setup

1. **Create `.env` from `.env.example`** - Required env vars:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SESSION_SECRET` - Any random string
   - `VITE_API_URL=http://localhost:5001`

2. **Database**: Run `npm run db:push` after setting DATABASE_URL

## Architecture Notes

- **Dev port**: Vite runs on 5173, proxies `/api` to Express on 5001
- **Client root**: `client/` (configured in `vite.config.ts`)
- **Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Server serves**: Both API and static production build
- **Mock data**: Auth uses demo personas (`/api/auth/demo-users`)

## CI/CD Pipeline

- GitHub Actions workflow: `.github/workflows/ci-cd.yml`
- Runs: type check → lint → build → Docker image
- Deploys to production on `main` branch push
- Tests run against PostgreSQL 16 service container

## Important Conventions

- **TypeScript strict mode enabled** (`tsconfig.json`)
- **React Query** for server state, custom hooks for client state
- **Radix UI** primitives via shadcn/ui components
- **Wouter** for routing (lightweight alternative to React Router)
- **Framer Motion** for animations
- **Web Audio API** for all sounds (no external audio files)

## Testing Notes

- Vitest for unit/component tests
- API tests: `tests/api.test.ts`
- Components tested in their own folders
- Run with `npm run test`

## Gotchas

- `npm run lint` is redundant with `npm run check` (both run `tsc --noEmit`)
- Build script (`tsx script/build.ts`) may not exist - if build fails, investigate alternative build method or restore the script
- Onboarding state stored in localStorage, reset via `useOnboarding().resetOnboarding()`
- Session uses HttpOnly cookies, 7-day expiry