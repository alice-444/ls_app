# Landing et authentification PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable visitors to discover the app, sign up, sign in, and complete onboarding (role selection) so that they can access the dashboard and core features.

## Why

**Business Justification:**
- First impression and conversion funnel
- Blocking path for all authenticated features
- Onboarding ensures correct role (MENTOR/APPRENANT) for UX

**Priority:** High (P0)

## What

### Feature Description
- **F01** : Landing page loads with links "Connexion", "Inscription"
- **F02** : Login success → redirect to `/dashboard` or `/onboarding`
- **F03** : Login failure → error message, no redirect
- **F04** : Sign-up success → redirect to onboarding or dashboard
- **F05** : Onboarding role selection (MENTOR | APPRENANT) → redirect, role persisted

### Scope
**In Scope:**
- Landing, login, sign-up, onboarding flows
- Better Auth integration
- Custom routes `/api/sign-up`, `/api/sign-in`, `/api/onboarding/select-role`

**Out of Scope:**
- OAuth providers
- Email verification flow (separate PRP)
- Forgot password (separate flow)

### User Stories
1. As a visitor, I want to see the landing page with CTAs so that I can sign up or log in
2. As a user, I want to log in with email/password so that I access my dashboard
3. As a new user, I want to sign up so that I can create an account
4. As a new user, I want to choose MENTOR or APPRENANT so that I see the right dashboard

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | Auth, routes, stack |
| `ai_docs/docs/patterns.md` | API patterns, Result type |
| `ai_docs/docs/database.md` | user, app_user, session |
| `ai_docs/docs/components.md` | SignInForm, SignUpForm |
| `front/src/lib/auth-client.ts` | Better Auth client |
| `back/src/lib/auth/services/signup.ts` | SignUpService |
| `back/src/lib/auth/services/signin.ts` | SignInService |
| `back/src/lib/auth/services/onboarding.ts` | OnboardingService |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/page.tsx` | MODIFY | Landing with Connexion/Inscription links |
| `front/src/components/sign-in-form.tsx` | MODIFY | Login form, error handling |
| `front/src/components/sign-up-form.tsx` | MODIFY | Sign-up form |
| `front/src/app/login/page.tsx` | MODIFY | Login page |
| `front/src/app/onboarding/page.tsx` | MODIFY | Role selection UI |
| `back/src/app/api/sign-up/route.ts` | MODIFY | Sign-up API |
| `back/src/app/api/sign-in/route.ts` | MODIFY | Sign-in API |
| `back/src/app/api/onboarding/select-role/route.ts` | MODIFY | Role selection API |

### Existing Patterns to Follow

```typescript
// API route pattern
const authResult = await getAuthenticatedSession(req);
if (!authResult.ok) return authResult.response;
const bodyResult = await parseJsonBodySafe(req, schema);
if (!bodyResult.ok) return bodyResult.response;
const result = await onboardingService.selectRole(userId, bodyResult.data);
return handleServiceResult(result);
```

### Dependencies
- Better Auth
- Tanstack Form + zod
- sonner (toast)

## Implementation Details

### API Endpoints

#### `POST /api/sign-up`
**Purpose:** Create user + app_user

**Request:**
```typescript
{ name: string, email: string, username: string, password: string }
```

**Response:** `{ success: boolean }` + session cookie

**Auth:** None

#### `POST /api/sign-in`
**Purpose:** Authenticate user

**Request:**
```typescript
{ email: string, password: string }
```

**Response:** `{ success: boolean }` + session cookie

**Auth:** None

#### `POST /api/onboarding/select-role`
**Purpose:** Set role MENTOR | APPRENANT

**Request:**
```typescript
{ role: "MENTOR" | "APPRENANT" }
```

**Response:** `{ success: boolean }`

**Auth:** Required (session)

### Database
- `app_user.role` updated on onboarding
- No new tables

## Validation Criteria

### Functional Requirements
- [x] Landing shows Connexion, Inscription links
- [x] Login success → redirect dashboard/onboarding
- [x] Login invalid credentials → error message
- [x] Sign-up success → redirect onboarding/dashboard
- [x] Onboarding role selection → redirect, role persisted
- [x] Next login skips onboarding if role set

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] No console errors
- [x] Loading states on forms
- [x] Error handling with toast

### Security Checklist
- [x] Input validation (zod)
- [x] Rate limiting on sign-up/sign-in
- [x] No password in logs

### Testing Steps
1. Visit `/` → see CTAs
2. Sign up → onboarding → select role → dashboard
3. Log out, log in → dashboard (no onboarding)
4. Invalid login → error message

---
