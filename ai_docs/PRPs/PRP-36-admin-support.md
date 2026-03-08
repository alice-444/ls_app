# Admin – gestion des demandes support PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable admins to view and manage support requests (support_request) so that they can respond to users and track resolution status.

## Why

**Business Justification:**
- Support team needs to see requests
- Status tracking (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
- Attachments access
- Reduces email-only workflow

**Priority:** Medium

## What

### Feature Description
- **Page `/admin/support`** : Liste des demandes support
- **Filtres** : Statut (PENDING, IN_PROGRESS, RESOLVED, CLOSED)
- **Détail** : Email, subject, description, problemType, attachments, userId (if logged in)
- **Actions** : Changer statut (IN_PROGRESS, RESOLVED, CLOSED)
- **Pièces jointes** : Lien pour télécharger (route existante)

### Scope
**In Scope:**
- List support requests
- Filter by status
- View detail
- Update status
- Access attachments (download link)

**Out of Scope:**
- Reply to user (email) - separate flow
- Assign to agent
- SLA tracking

### User Stories
1. As an admin, I want to see support requests so that I can process them
2. As an admin, I want to mark a request as resolved so that I can close it
3. As an admin, I want to view attachments so that I can understand the issue

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | support_request (status, attachments) |
| `back/src/app/api/support-request/route.ts` | Support API |
| `back/src/app/api/support-request/attachments/[filename]/route.ts` | Attachment download |
| `front/src/app/admin/feedback-moderation/page.tsx` | Admin page pattern |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/admin/support/page.tsx` | CREATE | Support requests list |
| `back/src/routers/` | MODIFY | Add support router or extend admin |
| `back/src/app/api/admin/support/route.ts` | CREATE | Or tRPC support.getRequests |

### Existing Patterns to Follow

```typescript
// support_request: userId?, email, subject, description, problemType, status, attachments
// SupportRequestStatus: PENDING, IN_PROGRESS, RESOLVED, CLOSED
```

### Dependencies
- support_request table
- ADMIN role
- Attachment route (PRP-19)

## Implementation Details

### tRPC Procedures

#### `support.getRequests`

**Input:** `{ status?: SupportRequestStatus, limit?: number }`

**Output:** `support_request[]` with user info if userId

**Auth:** ADMIN only

#### `support.updateStatus`

**Input:** `{ requestId: string, status: "IN_PROGRESS" | "RESOLVED" | "CLOSED" }`

**Output:** `{ success: boolean }`

**Auth:** ADMIN only

### Database
- `support_request`: id, userId?, email, subject, description, problemType, status, attachments (Json), createdAt

### Attachment Access
- URL: `/api/support-request/attachments/[filename]`
- Admin auth required to access

### Components

| Component | Location | Props |
|-----------|----------|-------|
| SupportRequestsList | - | requests |
| SupportRequestDetail | - | request |
| SupportRequestStatusSelect | - | request, onStatusChange |

## Validation Criteria

### Functional Requirements
- [x] Admin sees list of support requests
- [x] Filter by status
- [x] View full detail
- [x] Update status
- [x] Download attachments
- [x] Non-admin cannot access

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] Role check on backend
- [x] Attachment auth check

### Security Checklist
- [x] ADMIN role required
- [x] No bypass for attachments

### Testing Steps
1. Submit support request (user)
2. Login as admin → see request
3. Update status → RESOLVED
4. Download attachment

---
