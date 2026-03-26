# LearnSup Project Context (GEMINI.md)

Foundational mandates and context for Gemini CLI in the LearnSup workspace.

## 🎯 Project Overview
LearnSup is a pedagogical accompaniment application for tutors, learners, and workshops. It is structured as a TypeScript monorepo using Turborepo and pnpm.

## 🏗 Architecture & Workspace
- **Monorepo Manager:** Turborepo
- **Package Manager:** pnpm
- **Workspaces:**
  - `app/`: Next.js 16 (App Router) — UI, API routes, tRPC, Prisma, `server.ts` (HTTP + Socket.IO).
  - `shared/`: Shared Zod schemas, types, and utilities.
  - `infra/`: Docker configurations for development and production.
  - `docs/`: Comprehensive technical documentation.

## 🛠 Tech Stack
### Application (`app/`)
- **Framework:** Next.js 16.1.6, React 19 (pages + API)
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix UI)
- **Data:** TanStack Query, tRPC (client + server)
- **Auth:** Better Auth (client + server, e.g. `auth-server.ts`)
- **State/Forms:** TanStack Form, React Hook Form
- **Real-time:** Socket.IO (see `server.ts` / env for port, often 5050)
- **Database:** PostgreSQL via Prisma (`app/prisma/`)
- **Email:** Resend, React Email
- **Visio:** Daily.co
- **Image Processing:** Sharp, Cloudinary
- **Testing:** Vitest (`app/__tests__/units/`)

### Shared (`shared/`)
- **Validation:** Zod
- **Utilities:** Shared logic across front and back

## ⚙️ Key Configurations & Ports
- **Next.js (dev):** souvent `http://localhost:3001` (voir `app/package.json` / `pnpm dev`)
- **Socket.IO:** URL dans `NEXT_PUBLIC_SOCKET_URL` (souvent port **5050**)
- **Database:** PostgreSQL (default: `learnsup` DB)

### Environment Variables (Required)
- `app/.env`: secrets (`DATABASE_URL`, `BETTER_AUTH_*`, `CORS_ORIGIN`, `CRON_SECRET`, `RESEND_*`, `DAILY_*`, `POLAR_*`, …) + `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SOCKET_URL` (see `app/.env.example`, `docs/metier-et-ops.md`)

## 📜 Standard Workflows
- **Development:** `pnpm dev` (Turborepo → package `app`)
- **Database Sync:** `pnpm db:push` (syncs Prisma schema)
- **Type Checking:** `pnpm check-types`
- **Testing:** `pnpm test:unit` or `pnpm test:coverage`
- **Commits:** Follow [Conventional Commits](https://www.conventionalcommits.org/).

## 📖 Foundational Mandates
- **Surgical Updates:** When modifying code, maintain consistency with existing architectural patterns (tRPC, Prisma, shadcn/ui).
- **Type Safety:** Always prioritize end-to-end type safety using tRPC and shared Zod schemas.
- **Documentation:** Refer to `docs/` for detailed guides on patterns, security, and arborescence.
- **Workspace Imports:** Use `@ls-app/shared` for code shared between front and back.
- **Testing:** Add or update Vitest tests for any logic changes.
