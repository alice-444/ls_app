# Annulation apprenant (demande et participation) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable apprenants to cancel their workshop request (before acceptance) or their participation (after acceptance) so that they can manage their commitments and free slots for others.

## Why

**Business Justification:**
- User control : plans change
- Frees slot for other apprenants
- Credit refund logic (if applicable)
- Reduces no-show

**Priority:** High

## What

### Feature Description
- **Annuler une demande** : Apprenant cancels workshop_request (status PENDING) → status CANCELLED
- **Annuler une participation** : Apprenant cancels after mentor accepted → workshop_request CANCELLED, workshop may need update (apprenticeId cleared, status?)
- **UI** : Button "Annuler ma demande" / "Annuler ma participation" on dashboard, workshop detail

### Scope
**In Scope:**
- Cancel request (PENDING)
- Cancel participation (ACCEPTED → workshop exists)
- WorkshopRequestService.cancel
- Credit refund if workshop had cost (optional)
- Notification to mentor

**Out of Scope:**
- Mentor cancel (PRP-13)
- Partial refund rules (business logic)
- Cancellation deadline (e.g. 24h before)

### User Stories
1. As an apprenant, I want to cancel my pending request so that I can change my mind
2. As an apprenant, I want to cancel my participation so that I free the slot

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | workshop_request, workshop |
| `ai_docs/docs/services.md` | WorkshopRequestService |
| `back/src/routers/mentors/` | cancelRequest |
| `front/src/components/dashboard/ApprenantDashboard.tsx` | Request cards |
| `front/src/components/workshop/WorkshopActionsCard.tsx` | Actions |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/dashboard/` | MODIFY | Cancel button on requests |
| `front/src/components/workshop/WorkshopActionsCard.tsx` | MODIFY | Cancel participation |
| `back/src/routers/mentors/mentor.router.ts` | MODIFY | apprentice.cancelRequest |
| `back/src/lib/mentors/services/workshops/workshop-request.service.ts` | MODIFY | cancel logic |

### Existing Patterns to Follow

```typescript
// WorkshopRequestService.cancel(requestId, userId)
// Verify apprenticeId === userId
// If workshop exists: update workshop (clear apprenticeId?), notify mentor
```

### Dependencies
- WorkshopRequestService
- WorkshopRequestNotificationService
- CreditService (refund if applicable)

## Implementation Details

### tRPC Procedure

#### `apprentice.cancelRequest` or `mentor.cancelRequestByApprentice`
**Input:** `{ requestId: string }`

**Output:** `{ success: boolean }`

**Auth:** Required (APPRENANT, owner of request)

### Logic
- **Request PENDING** : Set status CANCELLED. No workshop yet.
- **Request ACCEPTED** : Workshop exists. Set request CANCELLED. Workshop: clear apprenticeId or set status? Notify mentor. Refund credits if applicable.

### Components

| Component | Location | Props |
|-----------|----------|-------|
| CancelRequestButton | - | request, onCancel |
| CancelParticipationDialog | - | workshop, open, onClose |

## Validation Criteria

### Functional Requirements
- [ ] Cancel pending request → status CANCELLED
- [ ] Cancel participation → request CANCELLED, workshop updated
- [ ] Mentor notified
- [ ] Credits refunded (if applicable)
- [ ] Button only for own requests

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Confirmation dialog before cancel
- [ ] Loading state

### Security Checklist
- [ ] Only apprentice can cancel own request
- [ ] Verify ownership

### Testing Steps
1. Create request → cancel → status CANCELLED
2. Mentor accepts → apprenant cancels → workshop updated, mentor notified

---
