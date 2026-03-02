# Auth (Login, Sign-up, Onboarding) PRP

## Goal

Build a complete auth flow for visitors and new users to sign up, sign in, and choose their role (MENTOR or APPRENANT) so that they can access the right dashboard and features on LearnSup.

## Why

New users need a clear path to register and choose whether they mentor or learn. Without onboarding, the app cannot show the correct dashboard (mentor vs apprenant). First impression and conversion depend on a smooth auth flow.

## What

An authentication and onboarding flow including:

- **Sign-up:** Email, password, name, username. Creates Better Auth user + app user (back). Front submits to custom `/api/sign-up`; session is established via Better Auth.
- **Sign-in:** Email + password. Better Auth or custom `/api/sign-in`. Redirect to `/dashboard` or `/onboarding` if role not set.
- **Onboarding:** One-time choice of role (MENTOR | APPRENANT). Stored on app user; redirect to dashboard after. Redirect logic: no role → onboarding; has role → dashboard.

## Technical Context

### Files to Reference (read-only)

- `ai_docs/docs/architecture.md`: System overview, auth routes.
- `ai_docs/docs/patterns.md`: API helpers, Result type, front form patterns.
- `back/src/lib/auth/services/signup.ts`: SignUpService – validation, Better Auth + app user creation.
- `back/src/lib/auth/services/signin.ts`: SignInService.
- `back/src/lib/auth/services/onboarding.ts`: OnboardingService – selectRole.
- `back/src/lib/api-helpers/auth.ts`: getAuthenticatedSession.
- `back/src/lib/api-helpers/result-handler.ts`: handleServiceResult.
- `front/src/lib/auth-client.ts`: authClient (Better Auth client).
- `front/src/components/sign-in-form.tsx`: Sign-in form (Tanstack Form, authClient.signIn.email).
- `front/src/components/sign-up-form.tsx`: Sign-up form.

### Files to Implement/Modify

#### Backend (Next.js API)

- `back/src/app/api/sign-up/route.ts`: MODIFY – POST, delegate to SignUpService.
- `back/src/app/api/sign-in/route.ts`: MODIFY – POST, delegate to SignInService.
- `back/src/app/api/onboarding/select-role/route.ts`: MODIFY – Auth + rate limit + OnboardingService.selectRole.

#### Frontend (Next.js App Router)

- `front/src/app/login/page.tsx`: MODIFY – Login layout + switch to sign-up.
- `front/src/app/onboarding/page.tsx`: CREATE/MODIFY – Role selection form, call API, redirect.
- `front/src/components/sign-in-form.tsx`: MODIFY – Validation, redirect after success.
- `front/src/components/sign-up-form.tsx`: MODIFY – Validation, redirect to onboarding or dashboard.

### Existing Patterns to Follow

- **Backend:** `parseJsonBodySafe` or `parseJsonBody` + `handleServiceResult` + `handleRouteError`. Protected routes: `getAuthenticatedSession(req)`.
- **Frontend:** `authClient.useSession()`, `authClient.signIn.email()`, Tanstack Form + zod validators, `toast` for feedback, `router.push('/dashboard')` or `router.push('/onboarding')`.
- **Naming:** PascalCase for components, camelCase for variables/functions.

## Implementation Details

### API Endpoints

- `POST /api/sign-up`: Body `{ email, password, name, username }`. Creates Better Auth user + app user. Response: success or error. Auth: None (public).
- `POST /api/sign-in`: Body `{ email, password }`. Authenticates user. Response: success or error. Auth: None (public).
- `POST /api/onboarding/select-role`: Body `{ role: "MENTOR" | "APPRENANT" }`. Sets role for current user. Response: success or error. Auth: Required (session).

### Database Changes

- Use existing `user`, `account`, `session`, `app_user` (Prisma). Ensure `app_user.role` is set by onboarding. No new tables.

### Components

- **SignInForm:** Form with email, password; submit calls Better Auth (or sign-in API); redirect on success.
- **SignUpForm:** Form with name, email, username, password; submit to `/api/sign-up`; redirect to onboarding or dashboard.
- **Onboarding page:** Role selection (MENTOR / APPRENANT), submit to `/api/onboarding/select-role`, then redirect to dashboard.

## Validation Criteria

### Functional Requirements

- [ ] User can sign up with valid email, password, name, username; then redirect to onboarding or dashboard.
- [ ] User can sign in with correct credentials; redirect to dashboard (or onboarding if no role).
- [ ] User with no role sees onboarding; after selecting role, redirect to dashboard and role is persisted.
- [ ] Invalid sign-in shows error message without redirect.

### Technical Requirements

- [ ] TypeScript compiles (`pnpm build` in front and back). ESLint passes.
- [ ] No hardcoded secrets in frontend. Loading and error states on forms.
- [ ] Rate limiting on onboarding (existing). Session required for select-role.

### Testing Steps

1. Sign up new user → should land on onboarding or dashboard.
2. Sign in with wrong password → error message, no redirect.
3. Sign in with correct credentials → dashboard (or onboarding if no role).
4. Onboarding: select MENTOR → dashboard shows mentor content; same for APPRENANT.

