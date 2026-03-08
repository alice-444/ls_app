# Page Mes ateliers (mentor) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable mentors to view and manage all their workshops in one dedicated page so that they can track drafts, published, completed, and cancelled workshops.

## Why

**Business Justification:**
- Central hub for mentor's workshops
- Beyond dashboard: full list with filters
- Better organization

**Priority:** Medium

## What

### Feature Description
- **Page `/my-workshops`** : Liste des ateliers du mentor
- **Filtres** : Statut (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
- **Tri** : Par date
- **Actions** : Edit (draft), view, cancel (published), mark complete
- **Cards** : WorkshopCard avec statut, date, participants

### Scope
**In Scope:**
- Page my-workshops
- List with filters
- Workshop cards
- Quick actions (edit, cancel, view)

**Out of Scope:**
- Workshop creation (PRP-13)
- Full workshop detail (PRP-13)
- Analytics (PRP-27)

### User Stories
1. As a mentor, I want to see all my workshops so that I can manage them
2. As a mentor, I want to filter by status so that I find drafts or completed
3. As a mentor, I want to edit a draft from this list so that I can publish it

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | workshop |
| `ai_docs/docs/components.md` | WorkshopCard, CreateWorkshopForm |
| `front/src/app/my-workshops/page.tsx` | My workshops page |
| `back/src/routers/workshops/workshop.router.ts` | getByCreator |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/my-workshops/page.tsx` | MODIFY | Full list, filters |
| `back/src/routers/workshops/workshop.router.ts` | MODIFY | getMyWorkshops (creatorId filter) |
| `front/src/components/workshop/WorkshopCard.tsx` | MODIFY | Mentor actions |

### Existing Patterns to Follow

```typescript
// workshop.getByCreator or workshop.getMyWorkshops
// Filter: creatorId = ctx.session.userId
// Status filter: DRAFT | PUBLISHED | CANCELLED | COMPLETED
```

### Dependencies
- WorkshopQueryService
- WorkshopService (cancel)

## Implementation Details

### tRPC Procedure

#### `workshop.getMyWorkshops`
**Input:** `{ status?: WorkshopStatus, limit?: number, cursor?: string }`

**Output:** `{ workshops: workshop[], nextCursor?: string }`

**Auth:** Required (MENTOR)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| MyWorkshopsPage | `app/my-workshops/` | - |
| WorkshopStatusFilter | - | value, onChange |
| WorkshopCard | `workshop/cards/` | workshop, onEdit, onCancel |

## Validation Criteria

### Functional Requirements
- [x] Mentor sees all their workshops
- [x] Filter by status works
- [x] Edit draft → workshop-editor
- [x] Cancel published → confirmation
- [x] View → workshop detail
- [x] Non-mentor redirected or 403

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] Loading states
- [x] Empty state

### Testing Steps
1. Login as mentor → my-workshops
2. Filter by DRAFT → only drafts
3. Edit draft → redirect to editor

---
