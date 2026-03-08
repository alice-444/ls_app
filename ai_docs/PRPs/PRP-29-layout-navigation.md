# Layout et navigation PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Provide a consistent layout (Header, Sidebar, Footer) and navigation with role-based routing so that the app has a coherent shell and users find their way.

## Why

**Business Justification:**
- UX consistency
- Role-based navigation (mentor vs apprenant)
- Protected routes, redirects

**Priority:** Medium (foundation)

## What

### Feature Description
- **Layout** : Header (logo, nav, user menu), Sidebar (section nav), Footer (links legal)
- **Navigation** : Links adapt to role (mentor: my-workshops, apprenant: workshop-room)
- **Routes protégées** : Redirect to login if not authenticated
- **Onboarding redirect** : If no role, redirect to /onboarding
- **UserMenu** : Profile, settings, logout

### Scope
**In Scope:**
- Layout components (Header, Sidebar, Footer)
- Route guards (middleware or layout check)
- Role-based nav items
- UserMenu dropdown
- Theme (dark/light) - ModeToggle

**Out of Scope:**
- Page content (other PRPs)
- Auth flows (PRP-02)

### User Stories
1. As a user, I want to see consistent header and nav so that I can navigate
2. As a mentor, I want to see mentor-specific links so that I access my tools
3. As an unauthenticated user, I want to be redirected to login when accessing protected pages

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/components.md` | Header, Footer, Sidebar, UserMenu |
| `front/src/components/header.tsx` | Header |
| `front/src/components/sidebar.tsx` | Sidebar |
| `front/src/components/footer.tsx` | Footer |
| `front/src/components/user-menu.tsx` | User menu |
| `front/src/app/layout.tsx` | Root layout |
| `front/src/middleware.ts` | Route protection (if exists) |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/layout.tsx` | MODIFY | Root layout |
| `front/src/components/header.tsx` | MODIFY | Nav, UserMenu |
| `front/src/components/sidebar.tsx` | MODIFY | Role-based items |
| `front/src/components/footer.tsx` | MODIFY | Legal links |
| `front/src/components/user-menu.tsx` | MODIFY | Profile, settings, logout |
| `front/src/middleware.ts` | MODIFY | Auth check, redirect |

### Existing Patterns to Follow

```typescript
// authClient.useSession() for role
// router.push('/login') if !session
// router.push('/onboarding') if session && !role
```

### Dependencies
- authClient (Better Auth)
- Next.js App Router

## Implementation Details

### Nav Items by Role

| Mentor | Apprenant | Both |
|--------|-----------|------|
| Dashboard | Dashboard | - |
| Mes ateliers | Catalogue | - |
| Créer atelier | - | - |
| - | Ateliers | - |
| - | - | Inbox |
| - | - | Réseau |
| - | - | Crédits |
| - | - | Paramètres |
| - | - | Profil |

### Route Protection
- Public: /, /login, /mentors, /mentors/[id], /legal, /terms, /privacy
- Auth required: /dashboard, /inbox, /settings, /workshop-room, etc.
- Role required: /mentor-profile (MENTOR), /workshop-editor (MENTOR)
- Onboarding: redirect if !app_user.role

### Components

| Component | Location | Props |
|-----------|----------|-------|
| Header | `header.tsx` | - |
| Sidebar | `sidebar.tsx` | - |
| Footer | `footer.tsx` | - |
| UserMenu | `user-menu.tsx` | user |
| NavLink | - | href, children |

## Validation Criteria

### Functional Requirements
- [x] Header visible on all pages
- [x] Footer with legal links
- [x] Sidebar shows role-appropriate items
- [x] UserMenu: profile, settings, logout
- [x] Unauthenticated → redirect login on protected
- [x] No role → redirect onboarding
- [x] Dark/light toggle works

### Technical Requirements
- [x] TypeScript compiles
- [x] ESLint passes
- [x] Mobile responsive (sidebar collapse)

### Testing Steps
1. Visit protected page logged out → redirect login
2. Login without role → redirect onboarding
3. Login as mentor → mentor nav
4. Login as apprenant → apprenant nav

---
