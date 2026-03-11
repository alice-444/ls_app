# Profil mentor – édition et publication PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable mentors to edit their profile (bio, domains, topics, photo, social links) and publish it so that their public profile is visible in the catalogue.

## Why

**Business Justification:**
- Mentors need to present themselves to apprenants
- Publication controls visibility (isPublished)
- Completes the mentor onboarding flow

**Priority:** High

## What

### Feature Description
- **Édition profil** : Bio, domain, areasOfExpertise, mentorshipTopics, qualifications, experience, socialMediaLinks, displayName, iceBreakerTags
- **Photo** : Upload (via ProfilePhotoUpload, see PRP-14)
- **Publication** : Toggle isPublished → profile visible in catalogue
- **Aperçu** : Preview card before publishing

### Scope
**In Scope:**
- Page `/mentor-profile` (mentor editing own profile)
- Routes `/api/profile/role/prof`, `/api/profile/publish`
- ProfProfileService
- Sections : BasicInformationSection, TagListSection, SocialMediaSection, PublicationSection

**Out of Scope:**
- Profil public (PRP-05)
- Photo upload details (PRP-14)

### User Stories
1. As a mentor, I want to edit my bio and expertise so that apprenants know me
2. As a mentor, I want to publish my profile so that I appear in the catalogue
3. As a mentor, I want to preview my profile before publishing so that I check it

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | app_user (mentor fields) |
| `ai_docs/docs/services.md` | ProfProfileService |
| `ai_docs/docs/components.md` | mentor-profile sections |
| `back/src/app/api/profile/role/prof/route.ts` | Prof profile update |
| `back/src/app/api/profile/publish/route.ts` | Publish toggle |
| `front/src/app/mentor-profile/page.tsx` | Mentor profile edit page |
| `front/src/components/mentor-profile/*.tsx` | Sections |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/mentor-profile/page.tsx` | MODIFY | Edit form |
| `front/src/components/mentor-profile/BasicInformationSection.tsx` | MODIFY | Bio, displayName |
| `front/src/components/mentor-profile/TagListSection.tsx` | MODIFY | areasOfExpertise, topics |
| `front/src/components/mentor-profile/SocialMediaSection.tsx` | MODIFY | Social links |
| `front/src/components/mentor-profile/PublicationSection.tsx` | MODIFY | isPublished toggle |
| `front/src/components/profil/ProfilePreviewCard.tsx` | MODIFY | Preview |
| `back/src/app/api/profile/role/prof/route.ts` | MODIFY | Update prof data |
| `back/src/app/api/profile/publish/route.ts` | MODIFY | Publish |

### Existing Patterns to Follow

```typescript
// ProfProfileService.update(userId, data)
// Only MENTOR role
// isPublished triggers publishedAt
```

### Dependencies
- ProfProfileService
- FileStorageService (photo)

## Implementation Details

### API Endpoints

#### `POST /api/profile/role/prof`
**Purpose:** Update mentor profile data

**Request:**
```typescript
{
  bio?: string
  domain?: string
  areasOfExpertise?: string[]
  mentorshipTopics?: string[]
  qualifications?: string
  experience?: string
  socialMediaLinks?: Record<string, string>
  displayName?: string
  iceBreakerTags?: string[]
}
```

**Response:** `{ success: boolean }`

**Auth:** Required (MENTOR)

#### `POST /api/profile/publish`
**Purpose:** Toggle isPublished

**Request:** `{ isPublished: boolean }`

**Response:** `{ success: boolean }`

**Auth:** Required (MENTOR)

### Database
- `app_user`: bio, domain, areasOfExpertise, mentorshipTopics, qualifications, experience, socialMediaLinks, displayName, iceBreakerTags, isPublished, publishedAt

### Components

| Component | Location | Props |
|-----------|----------|-------|
| BasicInformationSection | `mentor-profile/` | - |
| TagListSection | `mentor-profile/` | - |
| SocialMediaSection | `mentor-profile/` | - |
| PublicationSection | `mentor-profile/` | - |
| ProfilePreviewCard | `profil/` | profile |

## Validation Criteria

### Functional Requirements
- [ ] Mentor can edit all profile fields
- [ ] Save updates app_user
- [ ] Publish toggle sets isPublished, publishedAt
- [ ] Unpublish hides from catalogue
- [ ] Preview shows public view
- [ ] Photo upload works (PRP-14)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Validation (zod) on fields
- [ ] Loading states

### Security Checklist
- [ ] Only MENTOR can edit
- [ ] Only own profile
- [ ] Sanitize social links

### Testing Steps
1. Login as mentor → edit profile → save
2. Publish → profile visible at /mentors/[id]
3. Unpublish → 404 or hidden

---
