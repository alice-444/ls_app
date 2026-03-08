# Catalogue ateliers et demandes PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable apprenants to browse published workshops, filter them, and request participation, so that mentors receive requests and can accept/refuse from their dashboard.

## Why

**Business Justification:**
- Core business flow : discovery → request → acceptance
- Mentors need visibility on their published workshops
- Apprenants need a clear catalogue and request flow

**Priority:** High (P1)

## What

### Feature Description
- **F08** : Catalogue page with list of published workshops
- Filter (optional) by topic, date, etc.
- "Demander à participer" button → request created
- Confirmation (toast/message)
- Request appears in "Mes demandes" (apprenant) and "Demandes reçues" (mentor)

### Scope
**In Scope:**
- Catalogue page (`/workshop-room` or `/ateliers`)
- Workshop list with WorkshopCard
- Request participation flow
- tRPC `mentor.getPublicWorkshops`, workshop request procedures

**Out of Scope:**
- Workshop creation/editing (mentor flow)
- Video link generation
- Feedback after workshop

### User Stories
1. As an apprenant, I want to see published workshops so that I can choose one
2. As an apprenant, I want to request participation so that the mentor can accept me
3. As a mentor, I want to see requests in my dashboard so that I can accept/refuse

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | tRPC, workshop router |
| `ai_docs/docs/database.md` | workshop, workshop_request |
| `ai_docs/docs/services.md` | WorkshopRequestService, MentorWorkshopService |
| `ai_docs/docs/components.md` | WorkshopCard, RequestWorkshopParticipationDialog |
| `back/src/routers/mentors/mentor.router.ts` | getPublicWorkshops |
| `back/src/routers/workshops/workshop.router.ts` | Workshop procedures |
| `front/src/components/workshop/cards/WorkshopCard.tsx` | Card component |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/workshop-room/page.tsx` | MODIFY | Catalogue page |
| `front/src/components/workshop/cards/WorkshopCard.tsx` | MODIFY | Request button |
| `front/src/components/mentor/RequestWorkshopParticipationDialog.tsx` | MODIFY | Request dialog |
| `back/src/routers/mentors/mentor.router.ts` | MODIFY | getPublicWorkshops |
| `back/src/routers/workshops/` | MODIFY | createRequest or similar |

### Existing Patterns to Follow

```typescript
// Workshop request creation
// WorkshopRequestService.createRequest(apprenticeId, mentorId, workshopId?, message?)
```

### Dependencies
- WorkshopRequestService
- WorkshopRequestQueryService

## Implementation Details

### tRPC Procedures

#### `mentor.getPublicWorkshops`
**Purpose:** List published workshops (catalogue)

**Input:** `{ topic?: string, from?: Date, to?: Date }` (optional filters)

**Output:** `workshop[]` with creator info

#### `workshop.createRequest` or `mentor.requestParticipation`
**Purpose:** Create workshop_request

**Input:**
```typescript
{ workshopId?: string, mentorId: string, message?: string, preferredDate?: Date }
```

**Output:** `{ requestId: string }`

**Auth:** Required (APPRENANT)

### Database
- `workshop_request`: apprenticeId, mentorId, workshopId?, status PENDING

### Components

| Component | Location | Props |
|-----------|----------|-------|
| WorkshopCard | `workshop/cards/` | workshop, onRequest |
| WorkshopFilters | `workshop/filters/` | filters, onChange |
| RequestWorkshopParticipationDialog | `mentor/` | workshop, open, onClose |

## Validation Criteria

### Functional Requirements
- [x] Catalogue shows published workshops
- [x] Filters work (if implemented)
- [x] "Demander à participer" opens dialog
- [x] Submit creates request, shows confirmation
- [x] Request appears in apprenant dashboard
- [x] Request appears in mentor dashboard

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] Loading states
- [x] Error handling (e.g. already requested)
- [x] Credit check if workshop has cost

### Testing Steps
1. Login as apprenant → catalogue
2. Click "Demander à participer" → dialog → submit
3. Check "Mes demandes" → new request
4. Login as mentor → "Demandes reçues" → request visible

---
