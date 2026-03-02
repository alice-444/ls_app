# Auth secondaire (mot de passe oublié, reset, vérification email) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to recover their account (forgot password, reset) and verify email changes so that they can regain access and secure their account.

## Why

**Business Justification:**
- Common user need (forgot password)
- Security : email change requires verification
- Reduces support load

**Priority:** High

## What

### Feature Description
- **Mot de passe oublié** : User enters email → receives reset link → redirect to reset page
- **Reset password** : User lands on `/reset-password` with token → enters new password → success
- **Vérification changement email** : User clicks link in email → `/verify-email-change` → email updated

### Scope
**In Scope:**
- `/forgot-password` : form to request reset
- `/reset-password` : form with token (query or path)
- `/verify-email-change` : handler for email verification link
- ForgotPasswordService, Better Auth verification flow

**Out of Scope:**
- OAuth password reset
- Phone verification

### User Stories
1. As a user, I want to request a password reset so that I can regain access
2. As a user, I want to set a new password via the reset link so that I can log in again
3. As a user, I want to verify my new email so that my account uses the correct address

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | Better Auth, routes |
| `ai_docs/docs/services.md` | ForgotPasswordService |
| `front/src/app/forgot-password/page.tsx` | Forgot password page |
| `front/src/app/reset-password/page.tsx` | Reset password page |
| `front/src/app/verify-email-change/page.tsx` | Verify email page |
| `back/src/lib/auth/` | Better Auth config |
| `front/src/lib/auth-client.ts` | authClient.forgetPassword, etc. |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/forgot-password/page.tsx` | MODIFY | Forgot password form |
| `front/src/app/reset-password/page.tsx` | MODIFY | Reset form with token |
| `front/src/app/verify-email-change/page.tsx` | MODIFY | Verification handler |
| `back/src/lib/auth/` | MODIFY | Better Auth config if needed |

### Existing Patterns to Follow

```typescript
// Better Auth: authClient.forgetPassword({ email })
// Better Auth: authClient.resetPassword({ token, newPassword })
// Email sent via EmailService / Resend
```

### Dependencies
- Better Auth (forgetPassword, resetPassword)
- EmailService (Resend)
- Verification tokens (Better Auth)

## Implementation Details

### Flow Forgot Password
1. User visits `/forgot-password`
2. Enters email, submits
3. Backend sends reset email with link (token)
4. User clicks link → `/reset-password?token=xxx`
5. User enters new password, submits
6. Password updated, redirect to login

### Flow Verify Email Change
1. User requested email change (from settings)
2. Verification email sent
3. User clicks link → `/verify-email-change?token=xxx`
4. Backend verifies token, updates email
5. Redirect to settings or dashboard

### API / Better Auth
- `authClient.forgetPassword({ email })` : triggers reset email
- `authClient.resetPassword({ token, newPassword })` : updates password
- Better Auth handles verification routes

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ForgotPasswordForm | - | - |
| ResetPasswordForm | - | token |

## Validation Criteria

### Functional Requirements
- [ ] Forgot password form submits
- [ ] Reset email received (or mocked in test)
- [ ] Reset page with valid token → new password works
- [ ] Invalid/expired token → error message
- [ ] Verify email change → email updated

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Token expiry handled
- [ ] Loading states

### Security Checklist
- [ ] Token single-use
- [ ] Token expiry (e.g. 1h)
- [ ] No email enumeration (same message for existing/non-existing)

### Testing Steps
1. Forgot password → check email (or mock)
2. Reset with valid token → login works
3. Reset with invalid token → error
4. Verify email change → new email in account

---
