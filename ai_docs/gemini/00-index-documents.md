# Index des documents – Contexte Gemini

Liste des documents **ai_docs** avec chemin et courte description, pour charger le bon contexte dans l’ordre recommandé.

## Racine ai_docs

| Document | Description |
|----------|-------------|
| `ai_docs/README.md` | Structure du dossier, rôle de chaque partie. |
| `ai_docs/gemini-context.md` | Guide principal : quels docs fournir à l’IA, résumé copier-coller, liens. |

## PRD (cahier des charges)

| Document | Description |
|----------|-------------|
| `ai_docs/PRD/README.md` | Index PRD, ordre de lecture. |
| `ai_docs/PRD/PRD-00-vision-users.md` | Vision, objectifs, personas (Apprenant, Mentor, Admin). |
| `ai_docs/PRD/PRD-01-perimetre-fonctionnel.md` | Périmètre par domaine : auth, ateliers, dashboard, messagerie, crédits, support, modération. |
| `ai_docs/PRD/PRD-02-exigences-references.md` | Exigences non fonctionnelles, hors périmètre v1, références techniques. |

## EPTC (tests E2E)

| Document | Description |
|----------|-------------|
| `ai_docs/EPTC/README.md` | Index EPTC, config Cypress, ordre de lecture. |
| `ai_docs/EPTC/EPTC-01-back-sante.md` | B01 back disponible, B02 métriques. |
| `ai_docs/EPTC/EPTC-02-front-accueil-auth.md` | F01–F05 : landing, login, sign-up, onboarding. |
| `ai_docs/EPTC/EPTC-03-front-dashboard-workshops.md` | F06–F08 : dashboard apprenant/mentor, catalogue, demande atelier. |
| `ai_docs/EPTC/EPTC-04-front-pages-secondaires.md` | F09–F10 : profil mentor, support, crédits, inbox. |
| `ai_docs/EPTC/EPTC-05-priorisation-pratiques.md` | Priorisation P0/P1/P2, bonnes pratiques Cypress. |

## Documentation technique (docs/)

| Document | Description |
|----------|-------------|
| `ai_docs/docs/README.md` | Index des fichiers docs/. |
| `ai_docs/docs/architecture.md` | Architecture système LearnSup (front, back, DB, ports, flux). |
| `ai_docs/docs/services.md` | Services backend et responsabilités. |
| `ai_docs/docs/patterns.md` | Design patterns et conventions de code. |
| `ai_docs/docs/database.md` | Schéma de base de données (référence). |
| `ai_docs/docs/components.md` | Composants frontend clés. |

## Concept library – PRP Flow

| Document | Description |
|----------|-------------|
| `ai_docs/concept_library/README.md` | Présentation des concepts réutilisables. |
| `ai_docs/concept_library/cc_PRP_flow/README.md` | Définition du PRP, workflow, différence PRD vs PRP. |
| `ai_docs/concept_library/cc_PRP_flow/PRPs/base_template_v1.md` | Template PRP (Goal, Why, What, Technical Context, Validation). |
| `ai_docs/concept_library/cc_PRP_flow/PRPs/PRP-auth-login-signup-onboarding.md` | PRP Auth : login, sign-up, onboarding. |
| `ai_docs/concept_library/cc_PRP_flow/PRPs/PRP-workshop-catalogue-request.md` | PRP Catalogue ateliers et demande de participation. |
| `ai_docs/concept_library/cc_PRP_flow/PRPs/PRP-dashboard.md` | PRP Dashboard apprenant et mentor. |
