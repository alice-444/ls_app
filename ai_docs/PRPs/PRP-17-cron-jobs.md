# Cron jobs et maintenance backend PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable scheduled backend jobs to run maintenance tasks (video links, cashback, cleanup, purge) so that the system stays healthy and automated processes execute correctly.

## Why

**Business Justification:**
- Video links must be generated before workshops
- Cashback must be processed after workshops
- Inactive rooms and deleted accounts must be cleaned up
- Feedback notifications must be sent

**Priority:** High (operational)

## What

### Feature Description
- **generate-video-links** : Create Daily.co rooms for upcoming published workshops
- **process-cashback-queue** : Process workshop_cashback_queue (PENDING → PROCESSED)
- **retry-failed-cashbacks** : Retry FAILED cashbacks with retry limit
- **check-cashback-integrity** : Verify cashback consistency
- **cleanup-inactive-rooms** : Clean Daily rooms with no recent activity
- **purge-deletions** : Execute deletion_job (hard delete users)
- **create-feedback-notifications** : Create notifications for feedback requests

### Scope
**In Scope:**
- All cron routes under `/api/cron/*`
- Auth : cron secret or internal only
- Idempotency where applicable
- Error handling, logging

**Out of Scope:**
- Cron scheduler (Vercel Cron, external scheduler)
- New business logic

### User Stories
1. As an ops engineer, I want cron jobs to run on schedule so that the system is maintained
2. As a mentor, I want video links generated before my workshop so that participants can join

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/services.md` | WorkshopVideoLinkService, WorkshopCashbackService, etc. |
| `ai_docs/docs/database.md` | workshop_cashback_queue, deletion_job |
| `back/src/app/api/cron/generate-video-links/route.ts` | Video links cron |
| `back/src/app/api/cron/process-cashback-queue/route.ts` | Cashback cron |
| `back/src/app/api/cron/cleanup-inactive-rooms/route.ts` | Room cleanup |
| `back/src/app/api/cron/purge-deletions/route.ts` | Purge deletions |
| `back/src/app/api/cron/create-feedback-notifications/route.ts` | Feedback notifs |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `back/src/app/api/cron/*/route.ts` | MODIFY | Each cron handler |
| `back/src/lib/workshops/services/video/` | REFERENCE | Video link logic |
| `back/src/lib/workshops/services/rewards/` | REFERENCE | Cashback logic |

### Existing Patterns to Follow

```typescript
// Cron auth: check CRON_SECRET header or internal call
// GET or POST with auth
// Return 200 + summary { processed: N, errors: [] }
```

### Dependencies
- WorkshopVideoLinkService
- WorkshopCashbackService
- Daily API
- DeletionJob service

## Implementation Details

### Cron Routes

| Route | Purpose | Schedule (suggested) |
|-------|---------|----------------------|
| `GET /api/cron/generate-video-links` | Create Daily rooms for upcoming workshops | Daily, 1h before workshops |
| `GET /api/cron/process-cashback-queue` | Process PENDING cashbacks | Every 15min |
| `GET /api/cron/retry-failed-cashbacks` | Retry FAILED with retryCount < max | Daily |
| `GET /api/cron/check-cashback-integrity` | Integrity check, alert if issues | Daily |
| `GET /api/cron/cleanup-inactive-rooms` | Clean inactive Daily rooms | Daily |
| `GET /api/cron/purge-deletions` | Run deletion_job where runAt <= now | Hourly |
| `GET /api/cron/create-feedback-notifications` | Notify to submit feedback | After workshop end |

### Auth
- Header `Authorization: Bearer ${CRON_SECRET}` or `x-cron-secret`
- Reject if missing or invalid

### Response Format
```typescript
{
  success: boolean
  processed?: number
  errors?: string[]
}
```

### Database
- `workshop_cashback_queue` : status, retryCount
- `deletion_job` : runAt, status
- `workshop` : dailyRoomId, dailyRoomLastActivityAt

## Validation Criteria

### Functional Requirements
- [ ] Each cron returns 200 with valid auth
- [ ] Unauthorized request returns 401
- [ ] generate-video-links creates rooms for upcoming workshops
- [ ] process-cashback-queue processes PENDING items
- [ ] purge-deletions runs deletion jobs
- [ ] Idempotent where possible (no double processing)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Logging for debugging
- [ ] Error handling (don't crash on single failure)

### Security Checklist
- [ ] Cron secret required
- [ ] No public access
- [ ] No sensitive data in response

### Testing Steps
1. Call each cron with valid secret → 200
2. Call without secret → 401
3. Verify side effects (e.g. cashback processed)

---
