# Cycle de vie ateliers (création, visio, feedback) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable mentors to create, edit, and publish workshops, and enable participants to join the video call and submit feedback after the workshop, so that the full workshop lifecycle is supported.

## Why

**Business Justification:**
- Core mentor workflow
- Video integration (Daily.co) for virtual workshops
- Feedback builds trust and improves quality

**Priority:** High (core feature)

## What

### Feature Description
- **Création/édition** : Mentor creates workshop (title, description, date, time, topic, creditCost, etc.), edits draft
- **Publication** : Publish workshop → status PUBLISHED, appears in catalogue
- **Visio** : Daily.co room created, link generated, participant joins via JoinVideoButton
- **Feedback** : After workshop, apprenant submits rating + comment (SubmitFeedbackDialog)
- **Annulation** : Mentor can cancel (CANCELLED)

### Scope
**In Scope:**
- Workshop CRUD (create, edit, publish, cancel)
- Daily.co integration (room creation, webhook)
- Join video page
- Feedback submission
- Workshop status lifecycle: DRAFT → PUBLISHED → COMPLETED

**Out of Scope:**
- Cashback processing (cron, separate)
- Analytics (separate)
- Tipping (optional, separate)

### User Stories
1. As a mentor, I want to create a workshop so that apprenants can request it
2. As a mentor, I want to edit and publish my workshop so that it appears in the catalogue
3. As a participant, I want to join the video call so that I can attend the workshop
4. As a participant, I want to submit feedback so that I can rate the mentor

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | workshop, mentor_feedback |
| `ai_docs/docs/services.md` | WorkshopService, WorkshopVideoLinkService, WorkshopFeedbackService |
| `ai_docs/docs/components.md` | CreateWorkshopForm, DailyVideoCall, SubmitFeedbackDialog |
| `back/src/routers/workshops/workshop.router.ts` | Workshop procedures |
| `back/src/app/api/daily/webhook/route.ts` | Daily webhook |
| `back/src/app/api/cron/generate-video-links/route.ts` | Video link generation |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/workshop-editor/page.tsx` | MODIFY | Create/edit form |
| `front/src/app/workshop/[id]/page.tsx` | MODIFY | Workshop detail |
| `front/src/app/workshop/[id]/join-video/page.tsx` | MODIFY | Video join |
| `front/src/components/workshop/DailyVideoCall.tsx` | MODIFY | Daily embed |
| `front/src/components/workshop/SubmitFeedbackDialog.tsx` | MODIFY | Feedback form |
| `back/src/routers/workshops/workshop.router.ts` | MODIFY | create, update, publish, cancel |
| `back/src/routers/workshops/workshop-feedback.router.ts` | MODIFY | submitFeedback |

### Existing Patterns to Follow

```typescript
// WorkshopService.create(creatorId, data)
// WorkshopService.publish(workshopId)
// WorkshopVideoLinkService.getOrCreateRoom(workshopId)
// WorkshopFeedbackService.create(apprenticeId, mentorId, workshopId, rating, comment)
```

### Dependencies
- Daily.co API
- WorkshopService, WorkshopLifecycleService
- WorkshopFeedbackService

## Implementation Details

### tRPC Procedures

#### `workshop.create`
**Input:** WorkshopCreateInput (title, description, date, time, topic, creditCost, maxParticipants, etc.)
**Output:** `{ workshopId: string }`

#### `workshop.update`
**Input:** `{ workshopId: string, data: Partial<WorkshopUpdateInput> }`
**Output:** `{ success: boolean }`

#### `workshop.publish`
**Input:** `{ workshopId: string }`
**Output:** `{ success: boolean }`

#### `workshop.cancel`
**Input:** `{ workshopId: string }`
**Output:** `{ success: boolean }`

#### `workshop.getById`
**Input:** `{ workshopId: string }`
**Output:** `workshop` with creator

#### `workshop.getVideoLink`
**Input:** `{ workshopId: string }`
**Output:** `{ url: string, token?: string }`

#### `workshopFeedback.submit`
**Input:** `{ workshopId: string, rating: number, comment?: string, isAnonymous?: boolean }`
**Output:** `{ feedbackId: string }`

### API Endpoints

#### `POST /api/daily/webhook`
**Purpose:** Daily.co webhook (room events)

#### `GET /api/cron/generate-video-links`
**Purpose:** Cron to generate Daily rooms for upcoming workshops

### Database
- `workshop`: status (DRAFT, PUBLISHED, CANCELLED, COMPLETED), dailyRoomId
- `mentor_feedback`: mentorId, apprenticeId, workshopId, rating, comment

### Components

| Component | Location | Props |
|-----------|----------|-------|
| CreateWorkshopForm | `workshop-editor/` | - |
| EditWorkshopForm | `workshop-editor/` | workshop |
| DailyVideoCall | `workshop/` | roomUrl, token |
| JoinVideoButton | `workshop/` | workshop |
| SubmitFeedbackDialog | `workshop/` | workshop, open, onClose |
| WorkshopReviews | `workshop/` | workshopId |

## Validation Criteria

### Functional Requirements
- [x] Mentor creates workshop → draft saved
- [x] Mentor edits draft
- [x] Mentor publishes → appears in catalogue
- [x] Video link generated for published workshop
- [x] Participant joins video
- [x] After workshop, feedback dialog appears
- [x] Feedback submitted → visible in WorkshopReviews
- [x] Mentor can cancel workshop

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] Daily.co room creation
- [x] Webhook handles room events
- [x] Unique feedback per (apprenticeId, workshopId)

### Security Checklist
- [x] Only creator can edit/publish/cancel
- [x] Only participant can submit feedback
- [x] One feedback per participant per workshop

### Testing Steps
1. Create workshop → edit → publish
2. Join video (or mock)
3. Submit feedback
4. Verify feedback displayed

---
