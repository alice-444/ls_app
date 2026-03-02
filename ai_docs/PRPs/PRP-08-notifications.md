# Notifications in-app PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to receive in-app notifications in real time (e.g. new request, message, workshop reminder) so that they stay informed without leaving the app.

## Why

**Business Justification:**
- Engagement : users react to events
- Reduces missed requests/messages
- Real-time via Socket.IO

**Priority:** Medium

## What

### Feature Description
- Notification model : type, title, message, actionUrl, isRead
- In-app list (bell icon, dropdown or page)
- Real-time delivery via Socket.IO
- Mark as read
- Types : workshop request, message, workshop reminder, feedback, etc.

### Scope
**In Scope:**
- Notification creation (backend services)
- Notification list (tRPC)
- Real-time push (Socket)
- Bell icon + dropdown
- Mark read

**Out of Scope:**
- Push notifications (browser)
- Email notifications (separate)

### User Stories
1. As a user, I want to see my notifications so that I don't miss important events
2. As a user, I want notifications in real time so that I don't need to refresh
3. As a user, I want to mark notifications as read so that I can clear my list

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | notification table |
| `ai_docs/docs/services.md` | NotificationService, SocketNotificationEventEmitter |
| `back/src/routers/social/notification.router.ts` | Notification procedures |
| `front/src/components/notification-bell.tsx` | Bell component |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/notification-bell.tsx` | MODIFY | Dropdown, real-time |
| `front/src/app/notifications/page.tsx` | MODIFY | Full list |
| `back/src/routers/social/notification.router.ts` | MODIFY | list, markRead |
| `back/src/lib/notifications/services/` | MODIFY | Create, emit |

### Existing Patterns to Follow

```typescript
// NotificationService.create(userId, type, title, message, actionUrl)
// SocketNotificationEventEmitter.emit(userId, notification)
```

### Dependencies
- Socket.IO
- NotificationService

## Implementation Details

### tRPC Procedures

#### `notification.list`
**Input:** `{ unreadOnly?: boolean }`
**Output:** `notification[]`

#### `notification.markRead`
**Input:** `{ notificationId: string }` or `{ notificationIds: string[] }`
**Output:** `{ success: boolean }`

#### `notification.markAllRead`
**Output:** `{ success: boolean }`

### Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `notification:new` | Server → Client | { notification } |

### Database
- `notification`: userId, type, title, message, isRead, actionUrl, createdAt

### Notification Types
- WORKSHOP_REQUEST
- MESSAGE
- WORKSHOP_REMINDER
- FEEDBACK_RECEIVED
- REQUEST_ACCEPTED
- REQUEST_REJECTED

### Components

| Component | Location | Props |
|-----------|----------|-------|
| NotificationBell | `notification-bell.tsx` | - |
| NotificationDropdown | - | notifications |
| NotificationItem | - | notification, onMarkRead |

## Validation Criteria

### Functional Requirements
- [ ] Bell shows unread count
- [ ] Dropdown shows recent notifications
- [ ] Click notification → mark read, navigate to actionUrl
- [ ] New notification arrives in real time
- [ ] Full list page loads

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Socket subscription on mount
- [ ] Loading states

### Testing Steps
1. Trigger notification (e.g. create request) → mentor sees it
2. Click notification → mark read, navigate
3. Mark all read → count updates

---
