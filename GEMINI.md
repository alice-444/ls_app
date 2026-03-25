# LearnSup Project Context (GEMINI.md)

Foundational mandates and context for Gemini CLI in the LearnSup workspace.

## 🎯 Project Overview
LearnSup is a pedagogical accompaniment application for tutors, learners, and workshops. It is structured as a TypeScript monorepo using Turborepo and pnpm.

## 🏗 Architecture & Workspace
- **Monorepo Manager:** Turborepo
- **Package Manager:** pnpm
- **Workspaces:**
  - `front/`: Next.js 16 (App Router) frontend.
  - `back/`: Next.js 16 (API) + custom Socket.IO server + Prisma ORM.
  - `shared/`: Shared Zod schemas, types, and utilities.
  - `infra/`: Docker configurations for development and production.
  - `docs/`: Comprehensive technical documentation.

## 🛠 Tech Stack
### Frontend (`front/`)
- **Framework:** Next.js 16.1.6, React 19
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix UI)
- **Data Fetching:** TanStack Query, tRPC (client)
- **Auth:** Better Auth (client)
- **State/Forms:** TanStack Form, React Hook Form
- **Testing:** Vitest, Testing Library

### Backend (`back/`)
- **Framework:** Next.js 16.1.6 (API Routes)
- **Real-time:** Socket.IO (running on port 5050)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Better Auth (server)
- **API:** tRPC (server)
- **Email:** Resend, React Email
- **Visio:** Daily.co
- **Image Processing:** Sharp, Cloudinary
- **Testing:** Vitest

### Shared (`shared/`)
- **Validation:** Zod
- **Utilities:** Shared logic across front and back

## ⚙️ Key Configurations & Ports
- **Frontend:** `http://localhost:3001`
- **Backend (Next.js):** `http://localhost:4500`
- **Socket.IO:** `http://localhost:5050`
- **Database:** PostgreSQL (default: `learnsup` DB)

### Environment Variables (Required)
- `back/.env`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGIN`, `CRON_SECRET`
- `front/.env`: `NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SOCKET_URL`

## 📜 Standard Workflows
- **Development:** `pnpm dev` (starts front and back via turbo)
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
