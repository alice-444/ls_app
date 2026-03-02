# Profil apprenant PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable apprenants to edit their profile (study domain, program, display info) so that mentors can understand their context and personalize workshops.

## Why

**Business Justification:**
- Mentor context : know who they're teaching
- Personalization : match workshops to level
- Symmetry with mentor profile (PRP-18)

**Priority:** Medium

## What

### Feature Description
- **Édition profil apprenant** : studyDomain, studyProgram, displayName, bio (short), photo
- **Page** : `/my-profile` or `/profil` (role-based : apprenant vs mentor)
- **ApprenticeProfileService** : update logic
- **UserTitleService** : optional title (e.g. "Explorer")

### Scope
**In Scope:**
- Apprenant profile edit form
- studyDomain, studyProgram, displayName, bio
- Photo (shared with PRP-14)
- tRPC or API for update

**Out of Scope:**
- Public apprenant profile (MiniProfileModal is minimal)
- Mentor profile (PRP-18)

### User Stories
1. As an apprenant, I want to set my study domain so that mentors know my level
2. As an apprenant, I want to edit my display name so that I'm recognized

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | app_user (studyDomain, studyProgram) |
| `ai_docs/docs/services.md` | ApprenticeProfileService, UserTitleService |
| `front/src/app/my-profile/page.tsx` | Profile page |
| `front/src/app/profil/page.tsx` | Profile page (role-based?) |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/my-profile/page.tsx` | MODIFY | Apprenant form |
| `back/src/routers/users/apprentice.router.ts` | MODIFY | updateProfile |
| `back/src/lib/users/services/profile/apprentice-profile.service.ts` | MODIFY | update |

### Existing Patterns to Follow

```typescript
// ApprenticeProfileService.update(userId, data)
// Only APPRENANT role
// studyDomain, studyProgram, displayName, bio
```

### Dependencies
- ApprenticeProfileService
- accountSettings or apprentice router

## Implementation Details

### tRPC Procedure

#### `apprentice.updateProfile`
**Input:**
```typescript
{
  studyDomain?: string
  studyProgram?: string
  displayName?: string
  bio?: string
}
```

**Output:** `{ success: boolean }`

**Auth:** Required (APPRENANT)

### Database
- `app_user`: studyDomain, studyProgram, displayName, bio

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ApprenticeProfileForm | - | - |
| StudyDomainSelect | - | value, onChange |

## Validation Criteria

### Functional Requirements
- [ ] Apprenant can edit profile fields
- [ ] Save updates app_user
- [ ] Only APPRENANT can access
- [ ] Photo upload (PRP-14)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Validation on fields

### Testing Steps
1. Login as apprenant → edit profile → save
2. Verify data persisted

---
