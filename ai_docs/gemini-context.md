# Contexte Gemini – Guide d’utilisation

Guide pour fournir le bon contexte à l’IA (Gemini, Claude, etc.) sur le projet **LearnSup**.

## Où trouver quoi

| Besoin | Où aller |
|--------|----------|
| **Liste de tous les documents** | [gemini/00-index-documents.md](gemini/00-index-documents.md) |
| **Plan de tests E2E (EPTC)** | [EPTC/README.md](EPTC/README.md) → EPTC-01 à EPTC-05 |
| **Implémentation par feature (PRP)** | [PRPs/README.md](PRPs/README.md) → 36 PRPs (PRP-01 à PRP-36) |
| **Doc technique (architecture, patterns)** | [docs/](docs/) |
| **Template PRP** | [concept_library/cc_PRP_flow/PRPs/base_template_v1.md](concept_library/cc_PRP_flow/PRPs/base_template_v1.md) |

## Ordre de chargement recommandé

1. **Implémenter une feature** : PRP de la feature (PRPs/PRP-XX-*.md) + docs/architecture.md + docs/patterns.md + docs/database.md  
2. **Écrire des tests E2E** : EPTC/README + fichier EPTC du domaine (ex. EPTC-02 pour auth)  
3. **Rédiger un nouveau PRP** : concept_library/cc_PRP_flow/README + base_template_v1 + docs/  

## Résumé à copier-coller (contexte court)

**LearnSup** : plateforme d’apprentissage entre pairs (mentors / apprenants). Rôles : APPRENANT (voir ateliers, demander à participer, dashboard), MENTOR (créer ateliers, gérer demandes, profil publié). Stack : Next.js (front 3001, back 4500), tRPC, Better Auth, Prisma, PostgreSQL, Socket.IO. Auth : sign-up, sign-in, onboarding (choix MENTOR/APPRENANT). Fonctionnalités : ateliers (catalogue, demandes, accept/refuse), dashboard par rôle, profil mentor, messagerie, crédits (Polar), support, modération. Tests E2E : Cypress (baseUrl 4500), scénarios dans ai_docs/EPTC/. **36 PRPs** par feature dans ai_docs/PRPs/ (index : PRPs/README.md).

## Documents créés / modifiés récemment

- **PRPs** : 36 fichiers (PRP-01 à PRP-36) couvrant l'intégralité de l'app : back santé, auth, dashboards, ateliers, profils, messagerie, notifications, modération, réseau, crédits, admin, RGPD, cron, etc. Index : PRPs/README.md.  
- **EPTC** : EPTC-01 à EPTC-05 (back santé, accueil-auth, dashboard-workshops, pages secondaires, priorisation-pratiques).  
- **Docs** : architecture, database, services, patterns, components dans docs/.  
- **Gemini** : gemini/00-index-documents.md (liste complète des documents).
