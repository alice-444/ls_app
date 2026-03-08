# Admin dashboard PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Provide a central admin page with real-time stats and links to all admin tools (moderation, reports, support) so that admins have a single entry point for their tasks and can see at a glance what requires attention.

## Why

**Business Justification:**
- Efficiency: one place to start
- Discoverability of admin features
- Accountability: see pending counts (reports, support, feedback)
- Role protection: strictly restricted to ADMIN role

**Priority:** High

## What

### Feature Description
- **Page `/admin`**: Central Admin Hub
- **Dynamic Stats Cards**: Displaying counts for:
  - Pending User Reports
  - Pending Workshop Feedback Moderation
  - Pending Support Requests
  - Pending User Onboarding (AppUsers with status PENDING)
- **Navigation Links**: Direct access to specialized admin modules.
- **Access Control**: Role check at layout level.

### Scope
**In Scope:**
- Backend: `adminRouter` with `getStats` procedure.
- Backend: `userReportRouter` updates (admin procedures to list/process reports).
- Frontend: `/admin` page with a grid of status cards.
- Frontend: `/admin/layout.tsx` for global admin role check.

**Out of Scope:**
- Detailed user management (handled in PRP-12).
- Advanced analytics (handled in PRP-27).

### User Stories
1. As an admin, I want to see how many user reports are pending so that I can prioritize safety.
2. As an admin, I want to see how many support requests are open so that I can respond to users.
3. As an admin, I want to see how many new users are waiting for role validation.

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `back/src/lib/trpc.ts` | Reference `adminProcedure` |
| `back/prisma/schema/schema.prisma` | Model definitions |
| `back/src/routers/workshops/workshop-feedback.router.ts` | Example of `adminProcedure` usage |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `back/src/routers/admin/admin.router.ts` | CREATE | Central admin router |
| `back/src/routers/index.ts` | MODIFY | Register `admin` router |
| `back/src/routers/users/moderation/user-report.router.ts` | MODIFY | Add admin listing/review procedures |
| `front/src/app/admin/page.tsx` | CREATE | Admin dashboard UI |
| `front/src/app/admin/layout.tsx` | CREATE | Role check & Admin Navigation |

### Existing Patterns to Follow

```typescript
// Admin Stats Implementation
export const adminRouter = router({
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [reports, moderation, support, onboarding] = await Promise.all([
      prisma.user_report.count({ where: { status: "PENDING" } }),
      prisma.mentor_feedback.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.support_request.count({ where: { status: "PENDING" } }),
      prisma.app_user.count({ where: { status: "PENDING" } }),
    ]);
    return { reports, moderation, support, onboarding };
  }),
});
```

## Implementation Details

### Backend: Admin Router
- **Procedure `getStats`**: Aggregates counts from `user_report`, `mentor_feedback`, `support_request`, and `app_user`.
- **Procedure `getOnboardingQueue`**: List users with `status: PENDING`.

### Backend: User Report Router (Admin additions)
- **Procedure `getReportQueue`**: `adminProcedure` to list reports with pagination.
- **Procedure `reviewReport`**: `adminProcedure` to change status and add `adminNotes`.

### Frontend: Dashboard Components
- **StatsGrid**: A grid layout using Shadcn Cards.
- **AdminActionCard**: Component with title, icon, pending count, and link.

## Validation Criteria

### Functional Requirements
- [x] Only users with `ADMIN` role can access `/admin`.
- [x] Counts correctly reflect database state.
- [x] Links navigate to the correct sub-pages.
- [x] Non-admin users are redirected to `/` or see a 403.

### Technical Requirements
- [x] All procedures use `adminProcedure`.
- [x] Statistics fetch uses `Promise.all` for efficiency.
- [x] Frontend uses React Suspense or Skeleton loaders for stats.

### Testing Steps
1. Create a few pending reports and support requests via DB or other UIs.
2. Login as Admin.
3. Access `/admin` and verify counts match.
4. Attempt access as MENTOR/APPRENANT and verify 403/Redirect.

---
