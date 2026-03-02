# Admin dashboard PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Provide a central admin page with links to all admin tools (moderation, reports, support) so that admins have a single entry point for their tasks.

## Why

**Business Justification:**
- Efficiency: one place to start
- Discoverability of admin features
- Optional: stats overview

**Priority:** Low

## What

### Feature Description
- **Page `/admin`** : Hub admin central
- **Liens** : Modération feedbacks, Signalements utilisateurs, Demandes support
- **Optional** : Stats (nb users, nb workshops, nb pending reports)
- **Accès** : ADMIN role only

### Scope
**In Scope:**
- Admin landing page
- Links to /admin/feedback-moderation, /admin/user-reports, /admin/support
- Role check
- Simple layout

**Out of Scope:**
- Complex analytics dashboard
- Inline actions (just links)

### User Stories
1. As an admin, I want to see all admin tools in one place so that I can navigate quickly
2. As an admin, I want to see pending counts so that I know what needs attention

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `front/src/app/admin/feedback-moderation/page.tsx` | Existing admin page |
| `front/src/app/admin/user-reports/page.tsx` | User reports (PRP-30) |
| `front/src/app/admin/support/page.tsx` | Support (PRP-36) |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/admin/page.tsx` | CREATE/MODIFY | Admin dashboard |
| `front/src/app/admin/layout.tsx` | MODIFY | Admin layout, role check |

### Existing Patterns to Follow

```typescript
// Check admin role in layout or page
// Redirect to login or 403 if not admin
```

### Dependencies
- ADMIN role
- tRPC for counts (optional)

## Implementation Details

### Routes

| Link | Destination |
|------|-------------|
| Modération feedbacks | /admin/feedback-moderation |
| Signalements utilisateurs | /admin/user-reports |
| Demandes support | /admin/support |

### Optional tRPC

#### `admin.getStats`
**Output:** `{ pendingReports: number, pendingFeedbackModeration: number, pendingSupportRequests: number }`

**Auth:** ADMIN only

### Components

| Component | Location | Props |
|-----------|----------|-------|
| AdminDashboard | `app/admin/` | - |
| AdminNavCard | - | title, href, count? |

## Validation Criteria

### Functional Requirements
- [ ] Admin sees dashboard
- [ ] Links work (all admin pages exist)
- [ ] Non-admin → 403 or redirect
- [ ] Optional: counts displayed

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Role check in layout

### Testing Steps
1. Login as admin → /admin
2. Click each link → correct page
3. Non-admin → 403

---
