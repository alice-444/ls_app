# Marquage présence atelier PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable mentors to mark participant attendance (PRESENT, NO_SHOW) after a workshop so that cashback and analytics are accurate.

## Why

**Business Justification:**
- Cashback : only PRESENT participants get cashback
- No-show tracking : improve future scheduling
- Workshop completion tracking

**Priority:** Medium

## What

### Feature Description
- **Marquage** : Mentor marks apprenticeAttendanceStatus (PENDING → PRESENT or NO_SHOW)
- **Quand** : After workshop, on workshop detail or dashboard
- **WorkshopAttendanceService** : markPresent, markNoShow
- **Impact** : workshop_cashback_queue uses attendance for processing

### Scope
**In Scope:**
- UI for mentor to mark attendance
- WorkshopAttendanceService
- tRPC workshop.markAttendance
- Workshop with apprenticeId (one participant per workshop in current model?)

**Out of Scope:**
- Multiple participants per workshop (if model supports)
- Automatic detection (Daily.co presence)
- Apprenant self-check-in

### User Stories
1. As a mentor, I want to mark a participant as present so that they get cashback
2. As a mentor, I want to mark no-show so that the slot can be analyzed

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | workshop (apprenticeAttendanceStatus) |
| `ai_docs/docs/services.md` | WorkshopAttendanceService |
| `back/src/routers/workshops/workshop-attendance.router.ts` | Attendance procedures |
| `front/src/components/workshop/` | Workshop detail for mentor |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/workshop/[id]/page.tsx` | MODIFY | Attendance section (mentor) |
| `front/src/components/workshop/WorkshopParticipantsCard.tsx` | MODIFY | Mark attendance buttons |
| `back/src/routers/workshops/workshop-attendance.router.ts` | MODIFY | markPresent, markNoShow |

### Existing Patterns to Follow

```typescript
// WorkshopAttendanceService.markPresent(workshopId, userId)
// WorkshopAttendanceService.markNoShow(workshopId, userId)
// Only creator (mentor) can mark
// workshop.apprenticeAttendanceStatus
```

### Dependencies
- WorkshopAttendanceService
- workshop_cashback_queue (attendance affects eligibility)

## Implementation Details

### tRPC Procedures

#### `workshop.markAttendance`
**Input:** `{ workshopId: string, status: "PRESENT" | "NO_SHOW" }`

**Output:** `{ success: boolean }`

**Auth:** Required (MENTOR, workshop creator)

### Database
- `workshop.apprenticeAttendanceStatus`: PENDING | PRESENT | NO_SHOW

### Components

| Component | Location | Props |
|-----------|----------|-------|
| AttendanceMarking | `workshop/` | workshop, onMark |

## Validation Criteria

### Functional Requirements
- [ ] Mentor sees attendance section for COMPLETED workshop
- [ ] Mark PRESENT → status updated
- [ ] Mark NO_SHOW → status updated
- [ ] Cashback uses PRESENT only
- [ ] Only mentor (creator) can mark

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Workshop must be COMPLETED or past date

### Testing Steps
1. Complete workshop as mentor
2. Mark participant PRESENT
3. Verify cashback queue (or eligibility)

---
