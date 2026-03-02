# docs – Documentation technique pour l’IA

Documentation structurée pour que les assistants IA (Gemini, Claude, etc.) disposent du **contexte technique** du projet LearnSup (architecture, services, patterns, base de données, composants).

## Fichiers

| Fichier | Contenu |
|---------|---------|
| **architecture.md** | Vue d’ensemble (monorepo, ports, front/back/DB), schéma Mermaid, fonctionnalités métier, flux, liste des routers tRPC. Référence pour l’IA. |
| **services.md** | Services backend par domaine : auth (SignUp, SignIn, Onboarding), profil, workshops (lifecycle, query, feedback, cashback, video), mentors/workshop requests, messagerie, notifications, modération, crédits. |
| **patterns.md** | Patterns réels : routes API (getAuthenticatedSession, parseJsonBody, handleServiceResult), Result type, service + repository, tRPC (publicProcedure/protectedProcedure), Prisma. Front : Server/Client components, tRPC hooks, Tanstack Form + zod, conventions (camelCase, français/anglais). |
| **database.md** | Modèles Prisma : user, account, session, app_user, workshop, workshop_request, mentor_feedback, messagerie (conversation, message, message_reaction), user_connection, notification, user_block, user_report, support_request, credit_transaction, enums. Index et contraintes. |
| **components.md** | Composants front par zone : auth (SignInForm, SignUpForm), dashboard (Apprenant/Mentor), workshops (cards, requests, filters, visio), mentor/apprentice, profil/settings, messagerie, réseau/modération, layout/UI. Avec chemins sous `front/src/components/` et `front/src/app/`. |

## Usage

- À fournir en **contexte** avec le PRD et l’EPTC quand l’IA doit implémenter une feature ou rédiger des specs.
- Les **PRPs** (dans `concept_library/cc_PRP_flow/PRPs/`) peuvent référencer ces fichiers dans la section « Files to Reference ».
- Pour l’architecture détaillée du monorepo (ports, tRPC, Prisma), voir aussi la doc à la racine du repo : `docs/architecture.md`, `docs/front.md`, `docs/back.md`.
