# Messagerie temps réel PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to send and receive messages in real time within conversations, with reactions, presence, and read status, so that they can communicate around workshops and connections.

## Why

**Business Justification:**
- Core social feature for mentor-apprenant communication
- Real-time improves UX (no refresh)
- Supports workshop coordination

**Priority:** High (core feature)

## What

### Feature Description
- Conversations between two users (optionally linked to workshop)
- Send/receive messages in real time (Socket.IO)
- Read status (isRead)
- Reactions (message_reaction)
- Presence (online/offline)
- New conversation creation
- Edit/delete messages

### Scope
**In Scope:**
- Conversation list, chat window
- Message send/receive via Socket.IO + tRPC
- Reactions, presence
- New conversation dialog

**Out of Scope:**
- File attachments (separate)
- Group conversations
- Voice/video (Daily.co is workshop-specific)

### User Stories
1. As a user, I want to see my conversations so that I can message contacts
2. As a user, I want to send and receive messages in real time so that I don't need to refresh
3. As a user, I want to start a new conversation so that I can contact someone
4. As a user, I want to react to messages so that I can express quickly

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | Socket.IO, tRPC |
| `ai_docs/docs/database.md` | conversation, message, message_reaction |
| `ai_docs/docs/services.md` | ConversationService, MessagingService, PresenceService |
| `ai_docs/docs/components.md` | ChatWindow, MessageList, MessageInput |
| `back/src/routers/social/messaging.router.ts` | Messaging procedures |
| `back/src/socket/handlers/message.handler.ts` | Socket handlers |
| `front/src/components/messaging/` | Messaging components |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/inbox/page.tsx` | MODIFY | Conversation list |
| `front/src/app/inbox/[conversationId]/page.tsx` | MODIFY | Chat + Socket |
| `front/src/components/messaging/ChatWindow.tsx` | MODIFY | Real-time messages |
| `front/src/components/messaging/MessageInput.tsx` | MODIFY | Send via Socket/tRPC |
| `back/src/socket/handlers/message.handler.ts` | MODIFY | Emit events |
| `back/src/routers/social/messaging-message.router.ts` | MODIFY | sendMessage, etc. |

### Existing Patterns to Follow

```typescript
// Socket.IO: client emits "message:send", server broadcasts to conversation
// tRPC: messaging.sendMessage, messaging.getMessages
```

### Dependencies
- Socket.IO client (front) + server (back)
- Prisma: conversation, message, message_reaction

## Implementation Details

### Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `message:send` | Client → Server | { conversationId, content } |
| `message:new` | Server → Client | { message } |
| `message:read` | Client → Server | { conversationId, messageIds } |
| `typing:start` | Client → Server | { conversationId } |
| `presence:update` | Client → Server | { isOnline } |

### tRPC Procedures

#### `messaging.getConversations`
**Output:** `conversation[]` with lastMessage, unreadCount

#### `messaging.getMessages`
**Input:** `{ conversationId: string, cursor?: string }`
**Output:** `message[]` (paginated)

#### `messaging.sendMessage`
**Input:** `{ conversationId: string, content: string, replyToMessageId?: string }`
**Output:** `{ messageId: string }`

#### `messaging.createConversation`
**Input:** `{ participantId: string, workshopId?: string }`
**Output:** `{ conversationId: string }`

### Database
- `conversation`: participant1Id, participant2Id, workshopId?
- `message`: conversationId, senderId, content, isRead, replyToMessageId
- `message_reaction`: messageId, userId, emoji

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ConversationList | `messaging/` | conversations |
| ChatWindow | `messaging/` | conversationId |
| MessageList | `messaging/` | messages |
| MessageInput | `messaging/` | onSend |
| MessageReactions | `messaging/` | message |
| TypingIndicator | `messaging/` | userId |
| PresenceIndicator | `messaging/` | userId |

## Validation Criteria

### Functional Requirements
- [ ] Conversation list loads
- [ ] Messages load in chat
- [ ] Send message → appears in real time
- [ ] Other user receives message
- [ ] Read status updates
- [ ] Reactions work
- [ ] New conversation creation
- [ ] Presence indicator

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Socket.IO connection handling
- [ ] Reconnection logic
- [ ] Loading states

### Security Checklist
- [ ] User can only access own conversations
- [ ] Validate participant in conversation before send
- [ ] Blocked users cannot message

### Testing Steps
1. Two users, create conversation
2. Send message → both see it
3. React to message
4. Check presence (online/offline)

---
