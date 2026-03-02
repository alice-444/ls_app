# Emails transactionnels PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable the system to send transactional emails (workshop reminder, new message, request accepted, etc.) so that users stay informed via email in addition to in-app notifications.

## Why

**Business Justification:**
- Engagement : users may not check app daily
- Critical events : workshop reminder reduces no-show
- Reduces support ("I didn't know")

**Priority:** Medium

## What

### Feature Description
- **Types d'emails** : Workshop reminder, new message, request accepted/rejected, feedback reminder, password reset (auth, PRP-15), email verification
- **EmailService** : Resend or equivalent
- **Templates** : HTML emails with branding
- **Déclencheurs** : From services (WorkshopNotificationService, etc.) or cron

### Scope
**In Scope:**
- Email templates (or simple HTML)
- EmailService integration
- Triggers from existing services
- Workshop reminder (cron or event)

**Out of Scope:**
- Marketing emails
- Email preferences (unsubscribe) - could be in PRP-14
- Complex template engine

### User Stories
1. As a participant, I want to receive a workshop reminder so that I don't forget
2. As a user, I want to receive an email when my request is accepted so that I'm notified
3. As a user, I want to receive an email for new messages so that I can respond

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/services.md` | EmailService, WorkshopNotificationService |
| `back/src/lib/email/` | EmailService implementation |
| `back/src/lib/workshops/services/workshop-notification.service.ts` | Workshop notifs |
| `back/src/app/api/cron/create-feedback-notifications/route.ts` | Feedback notif cron |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `back/src/lib/email/` | MODIFY | Templates, send |
| `back/src/lib/workshops/services/workshop-notification.service.ts` | MODIFY | Send email on events |
| `back/src/app/api/cron/` | MODIFY | Workshop reminder cron |
| `back/src/lib/messaging/` | MODIFY | Email on new message (optional) |

### Existing Patterns to Follow

```typescript
// EmailService.send({ to, subject, html })
// Resend API
// Template: workshop-reminder, request-accepted, new-message
```

### Dependencies
- Resend (or SMTP)
- EmailService

## Implementation Details

### Email Types

| Type | Trigger | Content |
|------|---------|---------|
| WORKSHOP_REMINDER | Cron 24h/1h before | Date, time, link |
| REQUEST_ACCEPTED | Mentor accepts | Workshop details |
| REQUEST_REJECTED | Mentor rejects | Optional reason |
| NEW_MESSAGE | New message in conversation | Sender, preview |
| FEEDBACK_REMINDER | After workshop | Link to submit |
| PASSWORD_RESET | Forgot password | Link (Better Auth) |
| EMAIL_VERIFICATION | Change email | Link (Better Auth) |

### Triggers
- **Cron** : Workshop reminder (query upcoming, send)
- **Service** : WorkshopRequestService.accept → send REQUEST_ACCEPTED
- **Service** : MessagingService.send → send NEW_MESSAGE (if user pref)
- **Cron** : create-feedback-notifications → FEEDBACK_REMINDER

### Components
- Backend only (no frontend components)

## Validation Criteria

### Functional Requirements
- [ ] Workshop reminder sent before workshop
- [ ] Request accepted email sent
- [ ] New message email (if configured)
- [ ] Templates render correctly
- [ ] Unsubscribe link (optional)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] EmailService error handling
- [ ] No sensitive data in email

### Security Checklist
- [ ] Rate limit on send
- [ ] Validate recipient
- [ ] No injection in templates

### Testing Steps
1. Trigger workshop reminder → email received
2. Accept request → apprenant receives email
3. Check spam folder handling

---
