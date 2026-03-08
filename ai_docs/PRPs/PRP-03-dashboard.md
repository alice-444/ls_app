# Dashboards apprenant et mentor PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable apprenants to see their workshop requests and upcoming workshops, and mentors to see received requests and their workshops, so that both can manage their activity from a single view.

## Why

**Business Justification:**
- Core UX after login
- Apprenants need to track requests and workshops
- Mentors need to accept/refuse requests and manage workshops

**Priority:** High (P1)

## What

### Feature Description
- **F06** : Apprenant dashboard : pending requests, upcoming/past workshops, credit balance (if shown)
- **F07** : Mentor dashboard : received requests, upcoming workshops, accept/refuse actions

### Scope
**In Scope:**
- `/dashboard` page with role-based view
- ApprenantDashboard, MentorDashboard components
- tRPC queries for requests, workshops
- Accept/refuse request actions (mentor)

**Out of Scope:**
- Workshop creation from dashboard (separate flow)
- Credit purchase (separate page)
- Analytics/charts

### User Stories
1. As an apprenant, I want to see my pending requests and workshops so that I can track my activity
2. As a mentor, I want to see received requests so that I can accept or refuse them
3. As a mentor, I want to see my upcoming workshops so that I can manage them

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | tRPC, routers |
| `ai_docs/docs/components.md` | ApprenantDashboard, MentorDashboard |
| `ai_docs/docs/database.md` | workshop_request, workshop |
| `back/src/routers/mentors/mentor.router.ts` | Mentor procedures |
| `back/src/routers/users/apprentice.router.ts` | Apprentice procedures |
| `front/src/components/dashboard/ApprenantDashboard.tsx` | Apprenant view |
| `front/src/components/dashboard/MentorDashboard.tsx` | Mentor view |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/dashboard/page.tsx` | MODIFY | Role-based render |
| `front/src/components/dashboard/ApprenantDashboard.tsx` | MODIFY | Requests, workshops, credits |
| `front/src/components/dashboard/MentorDashboard.tsx` | MODIFY | Requests, accept/refuse |
| `back/src/routers/mentors/` | MODIFY | getReceivedRequests, etc. |
| `back/src/routers/users/apprentice.router.ts` | MODIFY | getMyRequests, getMyWorkshops |

### Existing Patterns to Follow

```typescript
// tRPC query
trpc.mentor.getReceivedRequests.useQuery();
trpc.apprentice.getMyRequests.useQuery();
```

### Dependencies
- tRPC client
- authClient.useSession() for role

## Implementation Details

### tRPC Procedures

#### `mentor.getReceivedRequests`
**Purpose:** List pending requests for mentor

**Input:** none (uses ctx.session)

**Output:** `workshop_request[]` with apprentice info

#### `mentor.acceptRequest` / `mentor.rejectRequest`
**Purpose:** Accept or reject a workshop request

**Input:** `{ requestId: string }`

**Output:** `{ success: boolean }`

#### `apprentice.getMyRequests`
**Purpose:** List apprenant's requests

**Output:** `workshop_request[]` with status

#### `apprentice.getMyWorkshops`
**Purpose:** List apprenant's upcoming/past workshops

**Output:** `workshop[]`

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ApprenantDashboard | `components/dashboard/` | - |
| MentorDashboard | `components/dashboard/` | - |
| RequestBadges | `components/dashboard/` | requests |
| AllWorkshopRequestsDialog | `components/dashboard/` | requests |
| AcceptWorkshopRequestDialog | `components/mentor/` | request |
| RejectWorkshopRequestDialog | `components/mentor/` | request |

## Validation Criteria

### Functional Requirements
- [x] Apprenant sees pending requests, workshops
- [x] Mentor sees received requests
- [x] Mentor can accept/refuse from dashboard
- [x] Links/buttons functional (cancel request, open workshop)
- [x] Credit balance shown if applicable

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] Loading states
- [x] Error handling
- [x] Role-based redirect (no APPRENANT on mentor view)

### Testing Steps
1. Login as apprenant → dashboard with requests/workshops
2. Login as mentor → dashboard with received requests
3. Mentor accept request → request status updated
4. Mentor reject request → request status updated
