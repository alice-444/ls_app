# Liste des mentors PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable visitors and apprenants to browse published mentors so that they can discover mentors by profile before choosing workshops.

## Why

**Business Justification:**
- Discovery path : browse mentors → view profile → request workshop
- Complements catalogue ateliers (browse by mentor vs by workshop)
- Trust : see mentor before committing

**Priority:** High

## What

### Feature Description
- **Page `/mentors`** : Grid or list of published mentors (isPublished)
- **Filtres** : Domain, topic, expertise (optional)
- **Carte mentor** : Photo, name, domain, short bio, link to profile
- **Lien** : Click → `/mentors/[id]` (profil public, PRP-05)

### Scope
**In Scope:**
- Liste mentors publiés
- Mentor cards with key info
- Filtres (domain, topic)
- Pagination ou infinite scroll

**Out of Scope:**
- Recherche full-text
- Tri avancé
- Profil détaillé (PRP-05)

### User Stories
1. As an apprenant, I want to browse mentors so that I can find someone matching my needs
2. As a visitor, I want to see available mentors so that I can decide to sign up

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | app_user, isPublished |
| `ai_docs/docs/components.md` | MentorProfileModal, MentorFeedbacks |
| `back/src/routers/mentors/mentor.router.ts` | getPublicMentors, list |
| `front/src/app/mentors/page.tsx` | Mentors list page |
| `front/src/app/mentors/[id]/page.tsx` | Mentor profile (PRP-05) |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/mentors/page.tsx` | MODIFY | Mentors grid, filters |
| `back/src/routers/mentors/mentor.router.ts` | MODIFY | getPublicMentors(filters) |
| `front/src/components/mentor/MentorCard.tsx` | CREATE/MODIFY | Card for list |

### Existing Patterns to Follow

```typescript
// Only isPublished mentors
// Filter by domain, mentorshipTopics, areasOfExpertise
```

### Dependencies
- mentor.getPublicMentors or mentor.list
- Workshop count per mentor (optional)

## Implementation Details

### tRPC Procedure

#### `mentor.getPublicMentors`
**Purpose:** List published mentors with optional filters

**Input:**
```typescript
{
  domain?: string
  topic?: string
  limit?: number
  cursor?: string
}
```

**Output:** `{ mentors: app_user[], nextCursor?: string }`

**Auth:** None (public)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| MentorsGrid | - | mentors |
| MentorCard | `mentor/` | mentor, workshopsCount? |
| MentorFilters | - | filters, onChange |

## Validation Criteria

### Functional Requirements
- [ ] Page loads with published mentors
- [ ] Filters work (domain, topic)
- [ ] Click mentor → profile page
- [ ] No unpublished mentors
- [ ] Pagination or load more

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Loading states
- [ ] Empty state if no mentors

### Testing Steps
1. Visit /mentors → list of mentors
2. Filter by domain → filtered list
3. Click mentor → /mentors/[id]

---
