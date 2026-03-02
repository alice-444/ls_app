# Contact mentor PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable apprenants to contact a mentor (open conversation or send initial message) from the mentor's profile so that they can ask questions before requesting a workshop.

## Why

**Business Justification:**
- Pre-request communication
- Trust building
- Reduces cold requests

**Priority:** Medium

## What

### Feature Description
- **ContactMentorDialog** : Opens from mentor profile or workshop card
- **Flow** : Create conversation (if none) + optional initial message, or redirect to inbox with pre-filled recipient
- **MentorContactService** : Handle contact logic (create conversation, first message)
- **Block check** : Cannot contact if blocked

### Scope
**In Scope:**
- ContactMentorDialog component
- Create conversation + send message
- Or open inbox with mentor selected
- MentorContactService

**Out of Scope:**
- Full messaging (PRP-07)
- Connection requirement (may or may not require connection first)

### User Stories
1. As an apprenant, I want to contact a mentor from their profile so that I can ask a question
2. As a mentor, I want to receive messages from interested apprenants so that I can respond

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/services.md` | MentorContactService, ConversationService |
| `ai_docs/docs/components.md` | ContactMentorDialog |
| `front/src/components/mentor/ContactMentorDialog.tsx` | Contact dialog |
| `back/src/routers/social/messaging.router.ts` | createConversation |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/mentor/ContactMentorDialog.tsx` | MODIFY | Contact flow |
| `back/src/lib/mentors/services/contact/mentor-contact.service.ts` | MODIFY | contact(mentorId, message?) |
| `back/src/routers/mentors/mentor.router.ts` | MODIFY | contactMentor procedure |

### Existing Patterns to Follow

```typescript
// MentorContactService.contact(apprenticeId, mentorId, message?)
// Creates conversation if not exists
// Sends initial message if provided
// Check UserBlockService before contact
```

### Dependencies
- ConversationService
- MessagingService
- UserBlockService

## Implementation Details

### tRPC Procedure

#### `mentor.contactMentor`
**Input:** `{ mentorId: string, message?: string }`

**Output:** `{ conversationId: string }`

**Auth:** Required (APPRENANT)

### Flow
1. User clicks "Contacter" on mentor profile
2. Dialog opens with optional message field
3. Submit → create conversation (or get existing) + send message
4. Redirect to /inbox/[conversationId] or close + toast

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ContactMentorDialog | `mentor/` | mentor, open, onClose |
| ContactButton | - | mentor |

## Validation Criteria

### Functional Requirements
- [ ] Contact button on mentor profile
- [ ] Dialog with optional message
- [ ] Submit creates conversation + message
- [ ] Redirect to inbox or success toast
- [ ] Blocked users cannot contact

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Reuse existing conversation if exists

### Security Checklist
- [ ] Block check
- [ ] Rate limit on contact (optional)

### Testing Steps
1. Click contact on mentor profile
2. Send message → conversation created
3. Block mentor → contact disabled or error

---
