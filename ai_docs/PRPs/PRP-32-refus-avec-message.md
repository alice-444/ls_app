# Refus de demande avec message PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable mentors to add an optional reason when rejecting a workshop request so that apprenants understand why and can improve future requests.

## Why

**Business Justification:**
- Better UX: apprenant knows why rejected
- Reduces frustration
- Constructive feedback (e.g. "dates not available", "topic not my expertise")

**Priority:** Medium

## What

### Feature Description
- **RejectWorkshopRequestDialog** : Add optional "reason" field

- **Stockage** : rejectionReason in workshop_request (or new field in schema)

- **Affichage** : Apprenant sees reason in "Mes demandes" when status = REJECTED

### Scope
**In Scope:**
- rejectionReason field (workshop_request)
- Reject dialog with reason input
- Display reason to apprenant
- WorkshopRequestService.reject with reason

**Out of Scope:**
- Predefined reasons (dropdown)
- Notify apprenant by email (PRP-26)

### User Stories
1. As a mentor, I want to add a reason when rejecting so that I can explain
2. As an apprenant, I want to see why my request was rejected so that I can improve

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | workshop_request |
| `ai_docs/docs/components.md` | RejectWorkshopRequestDialog |
| `front/src/components/mentor/RejectWorkshopRequestDialog.tsx` | Reject dialog |
| `back/src/lib/mentors/services/workshops/workshop-request.service.ts` | Reject logic |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/mentor/RejectWorkshopRequestDialog.tsx` | MODIFY | Add reason field |
| `back/src/lib/mentors/services/workshops/workshop-request.service.ts` | MODIFY | reject with reason |
| `back/prisma/schema/schema.prisma` | MODIFY | Add rejectionReason if not exists |
| `front/src/components/dashboard/` | MODIFY | Display reason on rejected |

### Existing Patterns to Follow

```typescript
// WorkshopRequestService.reject(requestId, mentorId, reason?)
// workshop_request.rejectionReason = reason
```

### Dependencies
- WorkshopRequestService
- WorkshopRequestNotificationService (include reason in notification)

## Implementation Details

### Database
- `workshop_request`: rejectionReason?: string (add if not in schema)

### tRPC Procedure

#### `mentor.rejectRequest`
**Input:** `{ requestId: string, reason?: string }`

**Output:** `{ success: boolean }`

**Auth:** Required (MENTOR, owner of request)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| RejectWorkshopRequestDialog | `mentor/` | request, open, onClose |
| RejectionReasonDisplay | - | reason |

## Validation Criteria

### Functional Requirements
- [ ] Mentor can add reason when rejecting
- [ ] Reason is optional
- [ ] Apprenant sees reason on rejected request
- [ ] Reason stored in DB

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Max length on reason (e.g. 500 chars)

### Testing Steps
1. Mentor rejects with reason → apprenant sees it
2. Mentor rejects without reason → works (optional)

---
