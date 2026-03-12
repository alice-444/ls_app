# Index des documents – Contexte Gemini

Liste des documents **ai_docs** avec chemin et courte description, pour charger le bon contexte dans l’ordre recommandé.

## Racine ai_docs

| Document | Description |
|----------|-------------|
| `ai_docs/README.md` | Structure du dossier, rôle de chaque partie. |
| `ai_docs/gemini-context.md` | Guide principal : quels docs fournir à l’IA, résumé copier-coller, liens. |

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

## PRPs (implémentation par feature)

| Document | Description |
|----------|-------------|
| `ai_docs/PRPs/README.md` | Index des 37 PRPs, ordre de lecture. |
| `ai_docs/PRPs/PRP-01-back-sante.md` | Back santé et métriques. |
| `ai_docs/PRPs/PRP-02-landing-auth.md` | Landing, login, sign-up, onboarding. |
| `ai_docs/PRPs/PRP-03-dashboard.md` | Dashboards apprenant et mentor. |
| `ai_docs/PRPs/PRP-04-workshops-catalogue.md` | Catalogue ateliers et demandes. |
| `ai_docs/PRPs/PRP-05-mentor-profile.md` | Profil mentor public. |
| `ai_docs/PRPs/PRP-06-pages-secondaires.md` | Support, crédits, inbox. |
| `ai_docs/PRPs/PRP-07-messagerie.md` | Messagerie temps réel. |
| `ai_docs/PRPs/PRP-08-notifications.md` | Notifications in-app. |
| `ai_docs/PRPs/PRP-09-moderation.md` | Blocage et signalement. |
| `ai_docs/PRPs/PRP-10-reseau.md` | Connexions entre utilisateurs. |
| `ai_docs/PRPs/PRP-11-credits.md` | Système crédits et achats. |
| `ai_docs/PRPs/PRP-12-admin.md` | Admin modération feedbacks. |
| `ai_docs/PRPs/PRP-13-workshop-lifecycle.md` | Cycle de vie ateliers (création, visio, feedback). |
| `ai_docs/PRPs/PRP-14-profil-parametres.md` | Profil et paramètres compte. |
| `ai_docs/PRPs/PRP-15-auth-secondaire.md` | Auth secondaire (mot de passe oublié, reset). |
| `ai_docs/PRPs/PRP-16-pages-statiques.md` | Pages statiques (légal, FAQ, aide). |
| `ai_docs/PRPs/PRP-17-cron-jobs.md` | Cron jobs et maintenance backend. |
| `ai_docs/PRPs/PRP-18-profil-mentor-edit.md` | Profil mentor – édition et publication. |
| `ai_docs/PRPs/PRP-19-support-attachments.md` | Support avec pièces jointes. |
| `ai_docs/PRPs/PRP-20-tipping.md` | Tipping (pourboires). |
| `ai_docs/PRPs/PRP-21-liste-mentors.md` | Liste des mentors. |
| `ai_docs/PRPs/PRP-22-annulation-apprenant.md` | Annulation apprenant. |
| `ai_docs/PRPs/PRP-23-profil-apprenant.md` | Profil apprenant. |
| `ai_docs/PRPs/PRP-24-marquage-presence.md` | Marquage présence atelier. |
| `ai_docs/PRPs/PRP-25-contact-mentor.md` | Contact mentor. |
| `ai_docs/PRPs/PRP-26-emails-transactionnels.md` | Emails transactionnels. |
| `ai_docs/PRPs/PRP-27-analytics-cashback.md` | Analytics cashback mentor. |
| `ai_docs/PRPs/PRP-28-epinglage-conversations.md` | Épinglage conversations. |
| `ai_docs/PRPs/PRP-29-layout-navigation.md` | Layout et navigation. |
| `ai_docs/PRPs/PRP-30-admin-signalements.md` | Admin – gestion des signalements. |
| `ai_docs/PRPs/PRP-31-export-donnees-rgpd.md` | Export données personnelles (RGPD). |
| `ai_docs/PRPs/PRP-32-refus-avec-message.md` | Refus de demande avec message. |
| `ai_docs/PRPs/PRP-33-page-mes-ateliers.md` | Page Mes ateliers (mentor). |
| `ai_docs/PRPs/PRP-34-admin-dashboard.md` | Admin dashboard. |
| `ai_docs/PRPs/PRP-35-cookie-consent.md` | Cookie consent / bandeau RGPD. |
| `ai_docs/PRPs/PRP-36-admin-support.md` | Admin – gestion des demandes support. |
| `ai_docs/PRPs/PRP-37-communaute.md` | Hub communauté (events, deals, spots, polls). |

## Concept library – PRP Flow

| Document | Description |
|----------|-------------|
| `ai_docs/concept_library/README.md` | Présentation des concepts réutilisables. |
| `ai_docs/concept_library/cc_PRP_flow/README.md` | Définition du PRP, workflow, différence PRD vs PRP. |
| `ai_docs/concept_library/cc_PRP_flow/PRPs/base_template_v1.md` | Template PRP (Goal, Why, What, Technical Context, Validation). |
