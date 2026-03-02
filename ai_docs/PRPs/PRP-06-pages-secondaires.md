# Pages secondaires (Support, Crédits, Inbox) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to access support, credits, and inbox pages so that they can get help, buy credits, and view conversations without errors.

## Why

**Business Justification:**
- Support : user can report issues
- Credits : monetization, workshop participation
- Inbox : core messaging entry point

**Priority:** Medium (P2) – smoke tests first

## What

### Feature Description
- **F10** : Three secondary pages load and display key content
  - **Support** : `/support-request` – form visible, submission works (or mock)
  - **Crédits** : `/buy-credits` or `/paliers` – page loads, no crash
  - **Inbox** : `/inbox` – conversation list (empty or populated), `/inbox/[id]` for single conversation

### Scope
**In Scope:**
- Page load, no console errors
- Support form visible and submittable
- Credits page displays balance/options
- Inbox list and conversation view

**Out of Scope:**
- Full support ticket workflow
- Payment integration (Polar) – separate PRP
- Full messaging UX – PRP-07

### User Stories
1. As a user, I want to submit a support request so that I can get help
2. As a user, I want to see my credit balance and buy credits so that I can participate in workshops
3. As a user, I want to see my conversations so that I can message others

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/architecture.md` | Routes, support, credits |
| `ai_docs/docs/components.md` | Messaging, support |
| `back/src/app/api/support-request/route.ts` | Support API |
| `back/src/routers/credits/credits.router.ts` | Credits tRPC |
| `back/src/routers/social/messaging.router.ts` | Messaging tRPC |
| `front/src/app/support-request/page.tsx` | Support page |
| `front/src/app/buy-credits/page.tsx` | Credits page |
| `front/src/app/inbox/page.tsx` | Inbox page |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/support-request/page.tsx` | MODIFY | Form, submit |
| `front/src/app/buy-credits/page.tsx` | MODIFY | Balance, options |
| `front/src/app/inbox/page.tsx` | MODIFY | Conversation list |
| `front/src/app/inbox/[conversationId]/page.tsx` | MODIFY | Chat view |

### Existing Patterns to Follow

```typescript
// Support: POST /api/support-request
// Credits: trpc.credits.getBalance.useQuery()
// Messaging: trpc.messaging.getConversations.useQuery()
```

### Dependencies
- EmailService (Resend) for support
- CreditService
- ConversationService, MessagingService

## Implementation Details

### API Endpoints

#### `POST /api/support-request`
**Purpose:** Submit support request

**Request:**
```typescript
{ email: string, subject: string, description: string, problemType?: string, attachments?: string[] }
```

**Response:** `{ success: boolean }`

**Auth:** Optional (userId if logged in)

### tRPC Procedures

#### `credits.getBalance`
**Purpose:** Get user credit balance

**Output:** `{ balance: number }`

#### `messaging.getConversations`
**Purpose:** List user's conversations

**Output:** `conversation[]` with last message, unread count

#### `messaging.getMessages`
**Purpose:** Get messages for a conversation

**Input:** `{ conversationId: string }`

**Output:** `message[]`

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ConversationList | `messaging/` | conversations |
| ChatWindow | `messaging/` | conversationId |
| MessageList, MessageInput | `messaging/` | - |

## Validation Criteria

### Functional Requirements
- [ ] Support page loads, form visible
- [ ] Support submit sends (or mocks) email
- [ ] Credits page loads, balance shown
- [ ] Inbox loads, list visible (empty or not)
- [ ] Inbox/[id] loads, messages visible
- [ ] No console errors

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Loading states
- [ ] Auth required for credits/inbox

### Testing Steps
1. Visit `/support-request` → form visible → submit
2. Visit `/buy-credits` → page loads
3. Visit `/inbox` → list loads
4. Click conversation → `/inbox/[id]` loads

---
