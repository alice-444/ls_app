# Pages statiques (légal, FAQ, aide) PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

Provide static content pages (legal, terms, privacy, help, FAQ) so that the app complies with legal requirements and users can find help.

## Why

**Business Justification:**
- Legal compliance (RGPD, CGU, politique de confidentialité)
- User support (FAQ, help center)
- Trust and transparency

**Priority:** Medium (legal required, help nice-to-have)

## What

### Feature Description
- **Légal** : `/legal` – page regroupant liens vers terms, privacy
- **CGU** : `/terms` – conditions générales d'utilisation
- **Confidentialité** : `/privacy` – politique de confidentialité
- **Info** : `/info` – à propos, contact
- **Aide** : `/help` – centre d'aide
- **FAQ** : `/faq` ou `/faq/[slug]` – questions fréquentes

### Scope
**In Scope:**
- Pages avec contenu statique (Markdown ou composants)
- Layout cohérent (Header, Footer)
- Liens dans footer, settings

**Out of Scope:**
- CMS pour éditer le contenu
- Recherche dans la FAQ
- Formulaire contact (support séparé)

### User Stories
1. As a visitor, I want to read the terms so that I know the rules
2. As a user, I want to read the privacy policy so that I understand data usage
3. As a user, I want to access the FAQ so that I can self-serve

## Technical Context

### Files to Reference (Read-Only)

| File | Purpose |
|------|---------|
| `ai_docs/docs/components.md` | Header, Footer, layout |
| `front/src/app/legal/page.tsx` | Legal page |
| `front/src/app/terms/page.tsx` | Terms page |
| `front/src/app/privacy/page.tsx` | Privacy page |
| `front/src/app/info/page.tsx` | Info page |
| `front/src/app/help/page.tsx` | Help page |
| `front/src/app/faq/` | FAQ pages |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `front/src/app/legal/page.tsx` | MODIFY | Legal hub |
| `front/src/app/terms/page.tsx` | MODIFY | CGU content |
| `front/src/app/privacy/page.tsx` | MODIFY | Privacy policy |
| `front/src/app/info/page.tsx` | MODIFY | About, contact |
| `front/src/app/help/page.tsx` | MODIFY | Help center |
| `front/src/app/faq/page.tsx` | MODIFY | FAQ list |
| `front/src/components/footer.tsx` | MODIFY | Links to legal |

### Existing Patterns to Follow

```typescript
// Server Component for static content
// Markdown or JSX content
// PageContainer, PageHeader for layout
```

### Dependencies
- None (static content)

## Implementation Details

### Routes

| Route | Content |
|-------|---------|
| `/legal` | Links to terms, privacy, info |
| `/terms` | CGU text |
| `/privacy` | Privacy policy (RGPD) |
| `/info` | About LearnSup, contact |
| `/help` | Help sections, links to FAQ |
| `/faq` | FAQ list, expandable items |

### Content Storage
- Markdown files in `content/` or inline in components
- Or CMS if project uses one

### Components

| Component | Location | Props |
|-----------|----------|-------|
| LegalContent | - | - |
| FaqItem | - | question, answer |
| HelpSection | - | title, content |

## Validation Criteria

### Functional Requirements
- [ ] All pages load without error
- [ ] Footer links to legal pages
- [ ] Terms, privacy content present
- [ ] FAQ expandable or navigable
- [ ] Mobile responsive

### Technical Requirements
- [ ] TypeScript compiles
- [ ] ESLint passes
- [ ] SEO meta tags (title, description)

### Testing Steps
1. Visit each page → loads
2. Click footer links → correct page
3. FAQ expand/collapse works

---
