# Profil et paramètres compte PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to manage their profile (photo, personal info) and account settings (password, email, notifications, blocked users, deletion) so that they have full control over their account.

## Why

**Business Justification:**
- User empowerment and data control
- GDPR compliance (account deletion)
- Security (password change, email verification)

**Priority:** High

## What

### Feature Description
- **Profil** : Upload photo, update display name, personal info (apprenant ou mentor selon rôle)
- **Changement mot de passe** : Current password + new password
- **Changement email** : New email + verification flow
- **Préférences notifications** : Toggle in-app notifications
- **Utilisateurs bloqués** : Liste des bloqués, déblocage (voir PRP-09)
- **Suppression compte** : Soft-delete, demande de suppression, jobs différés

### Scope
**In Scope:**
- Page `/settings` avec sections
- Page `/profil` ou `/my-profile` pour profil
- Routes API : `/api/profile/upload-photo`, `/api/profile/delete`, etc.
- tRPC accountSettings.*
- ChangePasswordService, ChangeEmailService, ForgotPasswordService, DeleteAccountService

**Out of Scope:**
- Profil mentor édition détaillée (PRP-18)
- OAuth account linking

### User Stories
1. As a user, I want to upload my profile photo so that others see me
2. As a user, I want to change my password so that I can secure my account
3. As a user, I want to change my email so that I use the right address
4. As a user, I want to delete my account so that my data is removed
5. As a user, I want to manage notification preferences so that I control what I receive

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/components.md` | Settings sections, ProfilePhotoUpload |
| `ai_docs/docs/services.md` | ChangePasswordService, ChangeEmailService, DeleteAccountService, FileStorageService |
| `back/src/app/api/profile/upload-photo/route.ts` | Photo upload |
| `back/src/app/api/profile/delete/route.ts` | Account deletion |
| `back/src/routers/users/account-settings.router.ts` | Account settings tRPC |
| `front/src/app/settings/page.tsx` | Settings page |
| `front/src/components/settings/*.tsx` | Sections |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/settings/page.tsx` | MODIFY | All sections |
| `front/src/components/settings/ChangePasswordSection.tsx` | MODIFY | Change password form |
| `front/src/components/settings/ChangeEmailSection.tsx` | MODIFY | Change email form |
| `front/src/components/settings/DeleteAccountSection.tsx` | MODIFY | Deletion flow |
| `front/src/components/settings/NotificationsSection.tsx` | MODIFY | Notification prefs |
| `front/src/components/profil/ProfilePhotoUpload.tsx` | MODIFY | Photo upload |
| `back/src/app/api/profile/upload-photo/route.ts` | MODIFY | Upload handler |
| `back/src/app/api/profile/delete/route.ts` | MODIFY | Deletion handler |

### Existing Patterns to Follow

```typescript
// getAuthenticatedSession(req) for protected routes
// IFileStorageService (Cloudinary / Local) for photo upload
// DeleteAccountService: soft-delete, deletion_job
```

### Dependencies
- Better Auth (password, email)
- IFileStorageService (Cloudinary support)
- DeleteAccountService, DeleteAccountEnhancedService

## Implementation Details

### API Endpoints

#### `POST /api/profile/upload-photo`
**Purpose:** Upload profile photo

**Request:** multipart/form-data with file

**Response:** `{ photoUrl: string }`

**Auth:** Required

#### `POST /api/profile/delete`
**Purpose:** Request account deletion (soft-delete)

**Request:** `{ reason?: string, password: string }`

**Response:** `{ success: boolean }`

**Auth:** Required

### tRPC Procedures

#### `accountSettings.updateProfile`
**Input:** Partial profile data (displayName, etc.)

#### `accountSettings.updateNotificationPrefs`
**Input:** `{ emailNotifications?: boolean, inAppNotifications?: boolean }`

### Database
- `app_user`: photoUrl, displayName, deletedAt, deletionRequestedAt, deletionReason
- `deletion_job`: for deferred purge

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ProfilePhotoUpload | `profil/` | onUpload |
| ChangePasswordSection | `settings/` | - |
| ChangeEmailSection | `settings/` | - |
| DeleteAccountSection | `settings/` | - |
| NotificationsSection | `settings/` | - |
| BlockedUsersSection | `settings/` | - |

## Validation Criteria

### Functional Requirements
- [ ] Photo upload works, displayed in profile
- [ ] Change password with current password validation
- [ ] Change email triggers verification
- [ ] Delete account → soft-delete, confirmation
- [ ] Notification prefs saved
- [ ] Blocked list displayed (from PRP-09)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] File size limit on upload
- [ ] Password strength validation

### Security Checklist
- [ ] Current password required for change
- [ ] Email verification for change
- [ ] Deletion confirmation (password)
- [ ] No hard delete without job

### Testing Steps
1. Upload photo → verify display
2. Change password → login with new
3. Request deletion → verify soft-delete

---
