# Cookie consent / bandeau RGPD PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Display a cookie consent banner when required by RGPD so that users can accept or refuse non-essential cookies and the app complies with regulations.

## Why

**Business Justification:**
- RGPD compliance
- Cookie law (e.g. France, EU)
- User choice before tracking

**Priority:** Low (legal)

## What

### Feature Description
- **Bandeau** : Appears on first visit (or when no consent stored)
- **Actions** : Accepter tout, Refuser, Personnaliser (optional)
- **Stockage** : Preference in localStorage (or cookie)
- **Lien** : Vers politique de confidentialité (PRP-16)
- **Persistence** : Don't show again after choice

### Scope
**In Scope:**
- Cookie banner component
- Accept / reject
- localStorage for preference
- Link to privacy page
- Optional: granular preferences (analytics, marketing)

**Out of Scope:**
- Full cookie management (list all cookies)
- Third-party consent management (OneTrust, etc.)
- A/B testing on consent

### User Stories
1. As a visitor, I want to accept or refuse cookies so that I control my data
2. As a visitor, I want to read the privacy policy so that I understand data usage

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/components.md` | Layout |
| `front/src/app/layout.tsx` | Root layout |
| `front/src/app/privacy/page.tsx` | Privacy page (PRP-16) |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/components/CookieConsentBanner.tsx` | CREATE | Banner |
| `front/src/app/layout.tsx` | MODIFY | Include banner |
| `front/src/lib/cookie-consent.ts` | CREATE | Storage, get/set |

### Existing Patterns to Follow

```typescript
// localStorage key: 'cookie-consent'
// Values: 'accepted' | 'rejected' | null (not set)
// Only load analytics/tracking if accepted
```

### Dependencies
- None (or analytics lib if conditional)
- Privacy page

## Implementation Details

### Storage
- Key: `cookie-consent`
- Values: `accepted` | `rejected`
- Expiry: 1 year (optional)

### Consent Types (if granular)
- Essential: always on (auth, session)
- Analytics: optional
- Marketing: optional

### Components

| Component | Location | Props |
|-----------|----------|-------|
| CookieConsentBanner | - | onAccept, onReject |
| CookieConsentButton | - | - |

### Layout
- Fixed bottom or top
- z-index above content
- Dismissible (must choose)

## Validation Criteria

### Functional Requirements
- [ ] Banner appears on first visit
- [ ] Accept → banner hides, preference stored
- [ ] Reject → banner hides, preference stored
- [ ] Link to privacy works
- [ ] Don't show again after choice
- [ ] Analytics/tracking conditional on consent (if applicable)

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] SSR compatible (check localStorage on client only)

### Testing Steps
1. Clear localStorage → visit → banner shows
2. Accept → banner hides, preference stored
3. Visit again → no banner

---
