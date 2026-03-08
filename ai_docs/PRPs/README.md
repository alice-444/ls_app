# PRPs – Product Requirement Prompts

Ce dossier contient les **PRP (Product Requirement Prompts)** pour l'intégralité de l'application LearnSup. Chaque PRP fournit à un agent IA tout le contexte nécessaire pour livrer du code production-ready du premier coup.

## Index des PRPs

| PRP | Feature | Priorité EPTC | Statut |
|-----|---------|---------------|--------|
| [PRP-01-back-sante.md](PRP-01-back-sante.md) | Back santé et métriques | P0/P2 | Done |
| [PRP-02-landing-auth.md](PRP-02-landing-auth.md) | Landing, login, sign-up, onboarding | P0 | Done |
| [PRP-03-dashboard.md](PRP-03-dashboard.md) | Dashboards apprenant et mentor | P1 | Done |
| [PRP-04-workshops-catalogue.md](PRP-04-workshops-catalogue.md) | Catalogue ateliers et demandes | P1 | Done |
| [PRP-05-mentor-profile.md](PRP-05-mentor-profile.md) | Profil mentor public | P2 | Done |
| [PRP-06-pages-secondaires.md](PRP-06-pages-secondaires.md) | Support, crédits, inbox (smoke) | P2 | Done |
| [PRP-07-messagerie.md](PRP-07-messagerie.md) | Messagerie temps réel | - | Done |
| [PRP-08-notifications.md](PRP-08-notifications.md) | Notifications in-app | - | Done |
| [PRP-09-moderation.md](PRP-09-moderation.md) | Blocage et signalement | - | Done |
| [PRP-10-reseau.md](PRP-10-reseau.md) | Connexions entre utilisateurs | - | Done |
| [PRP-11-credits.md](PRP-11-credits.md) | Système crédits et achats | - | Done |
| [PRP-12-admin.md](PRP-12-admin.md) | Admin modération feedbacks | - | Done |
| [PRP-13-workshop-lifecycle.md](PRP-13-workshop-lifecycle.md) | Cycle de vie ateliers (création, visio, feedback) | - | Done |
| [PRP-14-profil-parametres.md](PRP-14-profil-parametres.md) | Profil et paramètres compte | - | Done |
| [PRP-15-auth-secondaire.md](PRP-15-auth-secondaire.md) | Auth secondaire (mot de passe oublié, reset, vérification email) | - | Done |
| [PRP-16-pages-statiques.md](PRP-16-pages-statiques.md) | Pages statiques (légal, FAQ, aide) | - | Todo |
| [PRP-17-cron-jobs.md](PRP-17-cron-jobs.md) | Cron jobs et maintenance backend | - | Todo |
| [PRP-18-profil-mentor-edit.md](PRP-18-profil-mentor-edit.md) | Profil mentor – édition et publication | - | Done |
| [PRP-19-support-attachments.md](PRP-19-support-attachments.md) | Support avec pièces jointes | - | Done |
| [PRP-20-tipping.md](PRP-20-tipping.md) | Tipping (pourboires) | - | Todo |
| [PRP-21-liste-mentors.md](PRP-21-liste-mentors.md) | Liste des mentors | - | Done |
| [PRP-22-annulation-apprenant.md](PRP-22-annulation-apprenant.md) | Annulation apprenant (demande et participation) | - | Done |
| [PRP-23-profil-apprenant.md](PRP-23-profil-apprenant.md) | Profil apprenant | - | Done |
| [PRP-24-marquage-presence.md](PRP-24-marquage-presence.md) | Marquage présence atelier | - | Todo |
| [PRP-25-contact-mentor.md](PRP-25-contact-mentor.md) | Contact mentor | - | Done |
| [PRP-26-emails-transactionnels.md](PRP-26-emails-transactionnels.md) | Emails transactionnels | - | Todo |
| [PRP-27-analytics-cashback.md](PRP-27-analytics-cashback.md) | Analytics cashback mentor | - | Todo |
| [PRP-28-epinglage-conversations.md](PRP-28-epinglage-conversations.md) | Épinglage conversations | - | Done |
| [PRP-29-layout-navigation.md](PRP-29-layout-navigation.md) | Layout et navigation | - | Done |
| [PRP-30-admin-signalements.md](PRP-30-admin-signalements.md) | Admin – gestion des signalements utilisateurs | - | Done |
| [PRP-31-export-donnees-rgpd.md](PRP-31-export-donnees-rgpd.md) | Export données personnelles (RGPD) | - | Done |
| [PRP-32-refus-avec-message.md](PRP-32-refus-avec-message.md) | Refus de demande avec message | - | Todo |
| [PRP-33-page-mes-ateliers.md](PRP-33-page-mes-ateliers.md) | Page Mes ateliers (mentor) | - | Done |
| [PRP-34-admin-dashboard.md](PRP-34-admin-dashboard.md) | Admin dashboard | - | Done |
| [PRP-35-cookie-consent.md](PRP-35-cookie-consent.md) | Cookie consent / bandeau RGPD | - | Todo |
| [PRP-36-admin-support.md](PRP-36-admin-support.md) | Admin – gestion des demandes support | - | Done |
| [PRP-37-communaute.md](PRP-37-communaute.md) | Page Communauté / Hub membres | - | Done |

## Utilisation

1. Donner le PRP à un agent IA pour implémenter une feature
2. Le PRP contient : Goal, Why, What, Technical Context, Implementation Details, Validation Criteria
3. Références : `ai_docs/docs/` (architecture, database, services, patterns, components)

## Références

- Template : [concept_library/cc_PRP_flow/PRPs/base_template_v1.md](../concept_library/cc_PRP_flow/PRPs/base_template_v1.md)
- EPTC : [EPTC/](../EPTC/)
- Docs techniques : [docs/](../docs/)
