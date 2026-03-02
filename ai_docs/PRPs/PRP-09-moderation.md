# Modération (blocage et signalement) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to block or report other users so that they can protect themselves from harassment and inappropriate behavior while admins can review reports.

## Why

**Business Justification:**
- Safety and trust
- Compliance with platform policies
- User empowerment

**Priority:** Medium

## What

### Feature Description
- **Block** : block user → no messages, no visibility in lists, no connection
- **Report** : report user with reason (HARASSMENT, SPAM, INAPPROPRIATE_CONTENT, FAKE_PROFILE) and optional details
- Blocked users list in settings
- Block/Report dialogs from profile or context menu

### Scope
**In Scope:**
- user_block : blockerId, blockedId
- user_report : reporterId, reportedId, reason, details, status
- tRPC userBlock.*, userReport.*
- UI : BlockUserDialog, ReportUserDialog, BlockedUsersSection

**Out of Scope:**
- Admin review UI (separate)
- Automated actions based on reports

### User Stories
1. As a user, I want to block someone so that I don't see them anymore
2. As a user, I want to report someone so that admins can review
3. As a user, I want to see my blocked list so that I can unblock if needed

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | user_block, user_report, ReportReason |
| `ai_docs/docs/services.md` | UserBlockService, UserReport |
| `back/src/routers/users/moderation/user-block.router.ts` | Block procedures |
| `back/src/routers/users/moderation/user-report.router.ts` | Report procedures |
| `front/src/components/user/BlockUserDialog.tsx` | Block dialog |
| `front/src/components/user/ReportUserDialog.tsx` | Report dialog |
| `front/src/components/settings/BlockedUsersSection.tsx` | Blocked list |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/user/BlockUserDialog.tsx` | MODIFY | Block flow |
| `front/src/components/user/ReportUserDialog.tsx` | MODIFY | Report flow |
| `front/src/components/settings/BlockedUsersSection.tsx` | MODIFY | List, unblock |
| `back/src/routers/users/moderation/` | MODIFY | block, unblock, report |

### Existing Patterns to Follow

```typescript
// UserBlockService.block(blockerId, blockedId)
// UserBlockService.unblock(blockerId, blockedId)
// UserBlockService.isBlocked(blockerId, blockedId)
// Check before messaging, connection, etc.
```

### Dependencies
- UserBlockService
- UserReport repository

## Implementation Details

### tRPC Procedures

#### `userBlock.block`
**Input:** `{ blockedId: string }`
**Output:** `{ success: boolean }`

#### `userBlock.unblock`
**Input:** `{ blockedId: string }`
**Output:** `{ success: boolean }`

#### `userBlock.getBlockedList`
**Output:** `app_user[]` (blocked users)

#### `userBlock.isBlocked`
**Input:** `{ userId: string }`
**Output:** `{ blocked: boolean }`

#### `userReport.report`
**Input:** `{ reportedId: string, reason: ReportReason, details?: string, messageId?: string }`
**Output:** `{ reportId: string }`

### Database
- `user_block`: blockerId, blockedId (unique)
- `user_report`: reporterId, reportedId, reason, details, status (PENDING, etc.)

### Enums
- ReportReason: HARASSMENT, SPAM, INAPPROPRIATE_CONTENT, FAKE_PROFILE

### Integration Points
- MessagingService : block send if blocked
- ConnectionService : block connection if blocked
- Mentor list : filter blocked users
- Conversation list : filter blocked

### Components

| Component | Location | Props |
|-----------|----------|-------|
| BlockUserDialog | `user/` | user, open, onClose, onSuccess |
| ReportUserDialog | `user/` | user, open, onClose, onSuccess |
| BlockedUsersSection | `settings/` | - |

## Validation Criteria

### Functional Requirements
- [ ] Block user → user blocked, no messages
- [ ] Unblock user → user restored
- [ ] Report user → report created
- [ ] Blocked list in settings
- [ ] Blocked users filtered from lists

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Block check in messaging, connection
- [ ] No self-block, no duplicate block

### Security Checklist
- [ ] Cannot block self
- [ ] Report validation (reason required)
- [ ] Rate limit on report

### Testing Steps
1. Block user → try messaging → blocked
2. Unblock → messaging works
3. Report user → report in DB
4. Settings → blocked list → unblock

---
