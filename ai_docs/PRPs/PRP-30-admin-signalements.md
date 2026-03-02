# Admin – gestion des signalements utilisateurs PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable admins to review and manage user reports (harassment, spam, etc.) so that the platform can take action on inappropriate behavior and maintain a safe environment.

## Why

**Business Justification:**
- Platform safety
- Moderation of user-reported content
- Compliance with platform policies
- Different from feedback moderation (PRP-12) : user_report vs mentor_feedback

**Priority:** High

## What

### Feature Description
- **Page `/admin/user-reports`** : Liste des signalements (user_report) avec status PENDING
- **Détail** : Reporter, reported user, reason, details, messageId (if applicable)
- **Actions** : Dismiss, Resolve, Resolve with suspension (optional)
- **Admin notes** : Notes internes pour le suivi
- **Status** : PENDING → REVIEWED | RESOLVED | DISMISSED

### Scope
**In Scope:**
- List user reports (filter by status)
- View report detail
- Update status (resolve, dismiss)
- Admin notes
- Optional : suspend reported user

**Out of Scope:**
- Automated actions (AI moderation)
- Appeal flow
- Report analytics

### User Stories
1. As an admin, I want to see reported users so that I can review them
2. As an admin, I want to resolve or dismiss reports so that I can close cases
3. As an admin, I want to add notes so that I can track my reasoning

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | user_report, ReportReason, ReportStatus |
| `back/src/routers/users/moderation/user-report.router.ts` | userReport procedures |
| `front/src/app/admin/feedback-moderation/page.tsx` | Pattern for admin page |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/admin/user-reports/page.tsx` | CREATE | User reports list |
| `back/src/routers/users/moderation/user-report.router.ts` | MODIFY | getReports, updateStatus, addAdminNotes |

### Existing Patterns to Follow

```typescript
// user_report: reporterId, reportedId, reason, details, status
// ReportReason: HARASSMENT, SPAM, INAPPROPRIATE_CONTENT, FAKE_PROFILE
// ReportStatus: PENDING, REVIEWED, RESOLVED, DISMISSED
```

### Dependencies
- user_report table
- ADMIN role check

## Implementation Details

### tRPC Procedures

#### `userReport.getReports`
**Input:** `{ status?: ReportStatus, limit?: number }`

**Output:** `user_report[]` with reporter, reported user info

**Auth:** ADMIN only

#### `userReport.updateStatus`
**Input:** `{ reportId: string, status: "REVIEWED" | "RESOLVED" | "DISMISSED", adminNotes?: string }`

**Output:** `{ success: boolean }`

**Auth:** ADMIN only

#### `userReport.addAdminNotes`
**Input:** `{ reportId: string, adminNotes: string }`

**Output:** `{ success: boolean }`

**Auth:** ADMIN only

### Database
- `user_report`: reporterId, reportedId, reason, details, messageId?, status, reviewedAt, reviewedBy, adminNotes

### Components

| Component | Location | Props |
|-----------|----------|-------|
| UserReportsList | - | reports |
| UserReportDetail | - | report |
| ResolveReportDialog | - | report, onResolve |

## Validation Criteria

### Functional Requirements
- [ ] Admin sees list of reports
- [ ] Filter by status
- [ ] View report detail
- [ ] Resolve, dismiss, add notes
- [ ] Non-admin cannot access

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Role check on backend
- [ ] reviewedAt, reviewedBy updated

### Security Checklist
- [ ] ADMIN role required
- [ ] No bypass for non-admin

### Testing Steps
1. Login as admin → access page
2. Resolve report → status updated
3. Non-admin → 403

---
