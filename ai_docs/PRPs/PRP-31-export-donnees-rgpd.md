# Export données personnelles (RGPD) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Enable users to export their personal data (portabilité RGPD Article 20) so that they comply with their right to data portability and can take their data elsewhere.

## Why

**Business Justification:**
- Legal compliance (RGPD)
- User trust
- Often required before account deletion

**Priority:** High (legal)

## What

### Feature Description
- **Bouton "Exporter mes données"** : Dans paramètres (PRP-14)
- **Contenu export** : Profil (app_user), messages, conversations, ateliers, demandes, historique crédits, transactions
- **Format** : JSON ou ZIP avec fichiers structurés
- **API** : GET ou POST `/api/profile/export` ou tRPC
- **Délai** : Génération possible (async) ou synchrone

### Scope
**In Scope:**
- Export endpoint (API ou tRPC)
- Aggregation of user data
- JSON structure
- Download link or direct response
- Button in settings

**Out of Scope:**
- Export of other users' data (messages from others : only user's copy)
- Automated scheduled export
- GDPR "right to be forgotten" (delete account - PRP-14)

### User Stories
1. As a user, I want to export my data so that I can keep a copy
2. As a user, I want to export before deleting my account so that I don't lose everything

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/database.md` | user, app_user, message, conversation, workshop, etc. |
| `front/src/components/settings/` | Settings sections |
| `back/src/app/api/profile/` | Profile routes |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/settings/ExportDataSection.tsx` | CREATE | Export button |
| `back/src/app/api/profile/export/route.ts` | CREATE | Export API |
| `back/src/lib/users/services/account/export-data.service.ts` | CREATE | Data aggregation |

### Existing Patterns to Follow

```typescript
// ExportDataService.export(userId)
// Returns: { profile, messages, conversations, workshops, requests, credits, ... }
// Exclude sensitive: passwords, tokens
```

### Dependencies
- Prisma
- User data from multiple tables

## Implementation Details

### API Endpoint

#### `GET /api/profile/export`
**Purpose:** Export user data

**Response:** `application/json` or `application/zip` with JSON files

**Auth:** Required (own data only)

### Data to Include
- `profile.json`: app_user (exclude internal fields)
- `messages.json`: user's messages (with conversation context)
- `conversations.json`: conversations user participated in
- `workshops.json`: workshops (as creator or participant)
- `requests.json`: workshop_request
- `credits.json`: credit_transaction
- `connections.json`: user_connection

### Exclude
- Passwords, tokens
- Other users' private data (only user's view)
- Audit logs (optional)

### Components

| Component | Location | Props |
|-----------|----------|-------|
| ExportDataSection | `settings/` | - |
| ExportButton | - | onExport |

## Validation Criteria

### Functional Requirements
- [ ] User can request export
- [ ] Export contains all user data
- [ ] Format is readable (JSON)
- [ ] No sensitive data (passwords)
- [ ] Only own data

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] Large data handled (streaming or async)
- [ ] Rate limit (e.g. 1 export per hour)

### Security Checklist
- [ ] Auth required
- [ ] Only own userId
- [ ] No injection in export

### Testing Steps
1. Request export → download
2. Verify JSON structure
3. Verify data completeness

---
