# Épinglage conversations PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to pin conversations in their inbox so that important chats stay at the top.

## Why

**Business Justification:**
- UX : prioritize key conversations
- Reduces scrolling for frequent contacts
- Common messaging pattern

**Priority:** Low

## What

### Feature Description
- **Épingler** : User pins a conversation → appears at top of list
- **Désépingler** : Unpin
- **conversation_pin** table : conversationId, appUserId (unique)
- **Tri** : Pinned first, then by last message date

### Scope
**In Scope:**
- Pin/unpin action in conversation list
- conversation_pin CRUD
- Sort: pinned first
- tRPC messaging.pinConversation, unpinConversation

**Out of Scope:**
- Multiple pin order (custom order)
- Pin from chat header

### User Stories
1. As a user, I want to pin a conversation so that it stays at the top
2. As a user, I want to unpin so that I can reorder

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | conversation_pin |
| `back/src/routers/social/messaging-conversation.router.ts` | Conversation procedures |
| `front/src/components/messaging/ConversationList.tsx` | List with pin |
| `front/src/components/messaging/ConversationRow.tsx` | Row with pin button |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/messaging/ConversationList.tsx` | MODIFY | Sort pinned first |
| `front/src/components/messaging/ConversationRow.tsx` | MODIFY | Pin button |
| `back/src/routers/social/messaging-conversation.router.ts` | MODIFY | pin, unpin |
| `back/src/lib/messaging/` | MODIFY | ConversationService pin logic |

### Existing Patterns to Follow

```typescript
// conversation_pin: conversationId, appUserId
// Unique (conversationId, appUserId)
// getConversations: join with pin, sort pinned first
```

### Dependencies
- conversation_pin table
- ConversationService

## Implementation Details

### tRPC Procedures

#### `messaging.pinConversation`
**Input:** `{ conversationId: string }`

**Output:** `{ success: boolean }`

**Auth:** Required

#### `messaging.unpinConversation`
**Input:** `{ conversationId: string }`

**Output:** `{ success: boolean }`

**Auth:** Required

### Database
- `conversation_pin`: conversationId, appUserId (unique)

### Sort Logic
- getConversations: ORDER BY pinned DESC, lastMessageAt DESC

### Components

| Component | Location | Props |
|-----------|----------|-------|
| PinButton | `messaging/` | conversation, isPinned, onToggle |

## Validation Criteria

### Functional Requirements
- [x] Pin conversation → appears at top
- [x] Unpin → back to date order
- [x] Pin icon/button visible
- [x] Only own pins

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes

### Testing Steps
1. Pin conversation → list reorders
2. Unpin → list reorders

---
