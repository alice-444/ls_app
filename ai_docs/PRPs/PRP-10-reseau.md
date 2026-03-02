# Réseau (connexions) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to send and manage connection requests (like a social graph) so that they can build their network and message connected users.

## Why

**Business Justification:**
- Social layer : mentors and apprenants connect
- Prerequisite for messaging (or soft gate)
- Trust and discovery

**Priority:** Medium

## What

### Feature Description
- Send connection request: requester → receiver
- Accept / reject request
- List of connections (accepted)
- List of pending requests (sent, received)
- Remove connection
- Connection status: PENDING, ACCEPTED, REJECTED

### Scope
**In Scope:**
- user_connection table
- ConnectionService, tRPC connection.*
- PendingRequestsList, AcceptedConnectionsList
- Request from mentor profile, network page

**Out of Scope:**
- Recommendations (suggested connections)
- Connection limit
- Block integration (blocked users cannot connect)

### User Stories
1. As a user, I want to send a connection request so that I can connect with someone
2. As a user, I want to accept or reject requests so that I control my network
3. As a user, I want to see my connections so that I can message them
4. As a user, I want to remove a connection so that I can manage my list

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | user_connection, ConnectionStatus |
| `ai_docs/docs/services.md` | ConnectionService |
| `back/src/routers/social/connection.router.ts` | Connection procedures |
| `front/src/components/network/` | PendingRequestsList, etc. |
| `front/src/app/network/page.tsx` | Network page |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/network/page.tsx` | MODIFY | Network page |
| `front/src/components/network/PendingRequestsList.tsx` | MODIFY | Pending requests |
| `front/src/components/network/AcceptedConnectionsList.tsx` | MODIFY | Connections |
| `back/src/routers/social/connection.router.ts` | MODIFY | request, accept, reject, remove |

### Existing Patterns to Follow

```typescript
// user_connection: requesterId, receiverId, status
// Unique (requesterId, receiverId)
// Cannot request if already exists (any status)
```

### Dependencies
- ConnectionService
- UserBlockService (filter blocked)

## Implementation Details

### tRPC Procedures

#### `connection.sendRequest`
**Input:** `{ receiverId: string }`
**Output:** `{ requestId: string }`

#### `connection.acceptRequest`
**Input:** `{ requestId: string }`
**Output:** `{ success: boolean }`

#### `connection.rejectRequest`
**Input:** `{ requestId: string }`
**Output:** `{ success: boolean }`

#### `connection.removeConnection`
**Input:** `{ userId: string }`
**Output:** `{ success: boolean }`

#### `connection.getPendingReceived`
**Output:** `user_connection[]` (requests received)

#### `connection.getPendingSent`
**Output:** `user_connection[]` (requests sent)

#### `connection.getConnections`
**Output:** `app_user[]` (accepted connections)

#### `connection.getStatus`
**Input:** `{ userId: string }`
**Output:** `{ status: "PENDING" | "ACCEPTED" | "REJECTED" | "NONE" }`

### Database
- `user_connection`: requesterId, receiverId, status (PENDING, ACCEPTED, REJECTED)
- Unique (requesterId, receiverId)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| PendingRequestsList | `network/` | requests |
| PendingRequestItem | `network/` | request, onAccept, onReject |
| AcceptedConnectionsList | `network/` | connections |
| ConnectionItem | `network/` | user, onRemove |
| RemoveConnectionDialog | `network/` | user, open, onClose |

## Validation Criteria

### Functional Requirements
- [ ] Send request → receiver sees in pending
- [ ] Accept → both in connections list
- [ ] Reject → request removed
- [ ] Remove connection → both removed
- [ ] Cannot request if already connected
- [ ] Blocked users cannot connect

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] No duplicate requests
- [ ] Loading states

### Security Checklist
- [ ] User can only accept/reject own received requests
- [ ] User can only remove own connections
- [ ] Block check before send

### Testing Steps
1. User A sends request to B → B sees pending
2. B accepts → both see in connections
3. A removes → both removed
4. Blocked user → cannot send request

---
