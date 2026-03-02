# Admin modération feedbacks PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable admins to moderate mentor feedbacks (reviews) that have been reported, so that inappropriate content can be removed and the platform stays trustworthy.

## Why

**Business Justification:**
- Content moderation
- Trust in mentor feedback
- Compliance

**Priority:** Medium

## What

### Feature Description
- Admin page: `/admin/feedback-moderation`
- List of feedbacks under review (status UNDER_REVIEW)
- Reported feedbacks: reportedAt, reportedBy, reportReason
- Actions: approve (ACTIVE), delete (DELETED), dismiss report
- FeedbackModerationService

### Scope
**In Scope:**
- Admin-only page
- List reported feedbacks
- Approve / delete actions
- tRPC or API for moderation

**Out of Scope:**
- User report flow (PRP-09)
- Feedback creation (workshop flow)
- Bulk actions

### User Stories
1. As an admin, I want to see reported feedbacks so that I can review them
2. As an admin, I want to approve or delete feedbacks so that I can moderate content

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | mentor_feedback, FeedbackStatus |
| `ai_docs/docs/services.md` | FeedbackModerationService |
| `front/src/app/admin/feedback-moderation/page.tsx` | Admin page |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/admin/feedback-moderation/page.tsx` | MODIFY | Moderation UI |
| `back/src/routers/workshops/workshop-feedback.router.ts` | MODIFY | getReportedFeedbacks, approve, delete |
| `back/src/lib/workshops/services/feedback/feedback-moderation.service.ts` | MODIFY | approve, delete |

### Existing Patterns to Follow

```typescript
// FeedbackModerationService.getReportedFeedbacks()
// FeedbackModerationService.approve(feedbackId)
// FeedbackModerationService.delete(feedbackId)
```

### Dependencies
- FeedbackModerationService
- Role check: ADMIN

## Implementation Details

### tRPC Procedures

#### `workshopFeedback.getReportedFeedbacks`
**Output:** `mentor_feedback[]` with status UNDER_REVIEW, reportedAt, reportedBy, reportReason

**Auth:** ADMIN only

#### `workshopFeedback.approveFeedback`
**Input:** `{ feedbackId: string }`
**Output:** `{ success: boolean }`
**Action:** Set status ACTIVE, clear report

**Auth:** ADMIN only

#### `workshopFeedback.deleteFeedback`
**Input:** `{ feedbackId: string }`
**Output:** `{ success: boolean }`
**Action:** Set status DELETED

**Auth:** ADMIN only

### Database
- `mentor_feedback`: status (ACTIVE, UNDER_REVIEW, DELETED), reportedAt, reportedBy, reportReason

### Components

| Component | Location | Props |
|-----------|----------|-------|
| FeedbackModerationPage | `app/admin/feedback-moderation/` | - |
| ReportedFeedbackCard | - | feedback, onApprove, onDelete |

## Validation Criteria

### Functional Requirements
- [ ] Admin page loads (ADMIN role only)
- [ ] Non-admin redirected or 403
- [ ] List of reported feedbacks
- [ ] Approve → status ACTIVE
- [ ] Delete → status DELETED
- [ ] Refresh list after action

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Role check on backend
- [ ] Role check on frontend (route guard)

### Security Checklist
- [ ] ADMIN role required
- [ ] No bypass for non-admin

### Testing Steps
1. Login as admin → access page
2. Login as non-admin → 403 or redirect
3. Approve feedback → status updated
4. Delete feedback → status updated

---
