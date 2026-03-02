# Profil mentor public PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable visitors and apprenants to view a mentor's public profile (photo, bio, workshops) so that they can discover mentors and request participation in workshops.

## Why

**Business Justification:**
- Trust and discovery : apprenants need to see mentor info before requesting
- SEO and sharing : public URLs for mentors
- No private data exposed (email, etc.)

**Priority:** Medium (P2)

## What

### Feature Description
- **F09** : Public mentor profile at `/mentors/[id]` (or equivalent)
- Display : photo, bio, upcoming workshops (or link to catalogue)
- No private info (email, phone)
- Link/button "Demander à participer" to workshop or contact

### Scope
**In Scope:**
- Public profile page
- Mentor info from app_user (isPublished mentors only)
- Workshops list or link to catalogue filtered by mentor

**Out of Scope:**
- Mentor edit profile (settings flow)
- Private profile data
- Messaging from profile (separate)

### User Stories
1. As a visitor, I want to see a mentor's public profile so that I can decide to sign up
2. As an apprenant, I want to see mentor bio and workshops so that I can request participation

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | app_user, workshop, isPublished |
| `ai_docs/docs/components.md` | MentorProfileModal, MentorFeedbacks |
| `back/src/routers/mentors/mentor.router.ts` | getById, getPublicProfile |
| `front/src/app/mentors/[id]/page.tsx` | Mentor profile page |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/mentors/[id]/page.tsx` | MODIFY | Public profile layout |
| `front/src/components/mentor/MentorProfileModal.tsx` | REFERENCE | Reuse patterns |
| `back/src/routers/mentors/mentor.router.ts` | MODIFY | getPublicProfile(id) |

### Existing Patterns to Follow

```typescript
// Only return mentors with isPublished = true
// Exclude email, private fields
```

### Dependencies
- tRPC mentor.getPublicProfile
- Workshop list by mentor

## Implementation Details

### tRPC Procedure

#### `mentor.getPublicProfile`
**Purpose:** Get published mentor profile (public)

**Input:** `{ mentorId: string }`

**Output:**
```typescript
{
  id: string
  displayName: string
  photoUrl?: string
  bio?: string
  domain?: string
  areasOfExpertise?: string[]
  mentorshipTopics?: string[]
  workshops: workshop[]  // published only
}
```

**Auth:** None (public)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| MentorProfilePage | `app/mentors/[id]/` | - |
| WorkshopCreatorCard | `workshop/cards/` | mentor |
| MentorWorkshopHistory | `mentor/` | workshops |

## Validation Criteria

### Functional Requirements
- [ ] `/mentors/[id]` loads for published mentor
- [ ] Photo, bio, workshops displayed
- [ ] No email or private data
- [ ] Link to request participation
- [ ] 404 or appropriate for unpublished mentor

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] SEO meta tags (optional)

### Security Checklist
- [ ] Only isPublished mentors
- [ ] No sensitive fields in response

### Testing Steps
1. Visit `/mentors/[publishedMentorId]` → profile visible
2. Visit `/mentors/[unpublishedMentorId]` → 404 or redirect
3. Verify no email in HTML/network

---
