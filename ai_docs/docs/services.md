# LearnSup – Services backend

Description des services backend et de leurs responsabilités. Emplacement : `back/src/lib/`. Les routes API et les routers tRPC s’appuient sur ces services.

---

## Auth

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **SignUpService** | `auth/services/signup.ts` | Inscription : création compte Better Auth + app_user. Utilise AppUserRepository. Appelé par `POST /api/sign-up`. |
| **SignInService** | `auth/services/signin.ts` | Connexion (délégation Better Auth ou logique custom). Appelé par `POST /api/sign-in`. |
| **OnboardingService** | `auth/services/onboarding.ts` | Choix du rôle (MENTOR | APPRENANT). Méthode `selectRole(userId, body)`. Appelé par `POST /api/onboarding/select-role`. |
| **User helpers** | `auth/services/user-helpers.ts` | Utilitaires liés aux utilisateurs auth. |

---

## Profil et compte

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **ProfProfileService** | `auth/services/prof-profile.service.ts` (ou users) | Profil mentor : mise à jour bio, photo, publication (isPublished). Appelé par `/api/profile/role/prof`, `/api/profile/publish`. |
| **ApprenticeProfileService** | `users/services/profile/apprentice-profile.service.ts` | Profil apprenant. |
| **UserTitleService** | `users/services/profile/user-title.service.ts` | Gestion du titre utilisateur (ex. "Explorer"). |
| **ChangePasswordService** | `users/services/account/security/change-password.service.ts` | Changement de mot de passe. |
| **ChangeEmailService** | `users/services/account/security/change-email.service.ts` | Changement d’email (avec vérification). |
| **ForgotPasswordService** | `users/services/account/security/forgot-password.service.ts` | Mot de passe oublié. |
| **DeleteAccountService / DeleteAccountEnhancedService** | `users/services/account/deletion/` | Suppression de compte (soft-delete, jobs différés). Appelé par `/api/profile/delete`. |
| **FileStorageService** | `users/services/account/shared/file-storage.service.ts` | Stockage fichiers (ex. photo de profil, pièces jointes support). |

---

## Ateliers (workshops)

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **WorkshopService** | `workshops/services/workshop.service.ts` | Création, édition, publication, annulation, cycle de vie des ateliers. |
| **WorkshopLifecycleService** | `workshops/services/lifecycle/` | Gestion des transitions d’état (DRAFT → PUBLISHED → COMPLETED, etc.). |
| **WorkshopQueryService** | `workshops/services/query/workshop-query.service.ts` | Requêtes de lecture : liste, filtres, détail. |
| **WorkshopSchedulingService** | `workshops/services/scheduling/workshop-scheduling.service.ts` | Planification, conflits de dates. |
| **WorkshopVideoLinkService** | `workshops/services/video/workshop-video-link.service.ts` | Génération des liens Daily.co pour la visio. |
| **WorkshopAttendanceService** | `workshops/services/attendance/workshop-attendance.service.ts` | Gestion de la présence (PRESENT, NO_SHOW). |
| **WorkshopFeedbackService** | `workshops/services/feedback/workshop-feedback.service.ts` | Création et lecture des feedbacks (mentor_feedback). |
| **FeedbackModerationService** | `workshops/services/feedback/feedback-moderation.service.ts` | Modération des feedbacks (admin). |
| **WorkshopTippingService** | `workshops/services/feedback/workshop-tipping.service.ts` | Pourboires. |
| **WorkshopCashbackService** | `workshops/services/rewards/workshop-cashback.service.ts` | Cashback après atelier ; file `workshop_cashback_queue`. |
| **WorkshopNotificationService** | `workshops/services/workshop-notification.service.ts` | Notifications liées aux ateliers. |

---

## Mentors et demandes d’ateliers

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **WorkshopRequestService** | `mentors/services/workshops/workshop-request.service.ts` | Création, acceptation, refus, annulation des demandes (workshop_request). |
| **WorkshopRequestQueryService** | `mentors/services/workshops/workshop-request-query.service.ts` | Requêtes sur les demandes (liste mentor, liste apprenant). |
| **MentorWorkshopService** | `mentors/services/workshops/mentor-workshop.service.ts` | Création d’atelier à partir d’une demande acceptée, gestion côté mentor. |
| **WorkshopForRequestFactory** | `mentors/services/workshops/workshop-for-request.factory.ts` | Création d’un workshop à partir d’une request acceptée. |
| **WorkshopRequestNotificationService** | `mentors/services/workshops/workshop-request-notification.service.ts` | Notifications liées aux demandes. |
| **MentorFeedbackService** | `mentors/services/feedback/mentor-feedback.service.ts` | Feedbacks sur les mentors. |
| **MentorContactService** | `mentors/services/contact/mentor-contact.service.ts` | Prise de contact avec un mentor. |

---

## Messagerie

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **ConversationService** | `messaging/services/core/conversation.service.ts` | Création et liste des conversations. |
| **MessagingService** | `messaging/services/core/messaging.service.ts` | Envoi de messages, lecture, mise à jour (isRead). |
| **MessageOperationsService** | `messaging/services/core/message-operations.service.ts` | Opérations sur les messages (édition, suppression). |
| **MessageEnrichmentService** | `messaging/services/enrichment/message-enrichment.service.ts` | Enrichissement des messages (réactions, etc.). |
| **PresenceService** | `messaging/services/core/presence.service.ts` | Présence (en ligne / hors ligne). |
| Réactions | `messaging/services/reactions/` | Gestion des message_reaction. |
| Handlers Socket | `socket/handlers/message.handler.ts` | Événements Socket.IO pour la messagerie en temps réel. |

---

## Notifications

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **NotificationService** | `notifications/services/notification.service.interface.ts` (et implémentation) | Création, liste, marquage lu des notifications. |
| **SocketNotificationEventEmitter** | `notifications/services/socket-notification-event-emitter.ts` | Émission d’événements Socket pour les notifs en temps réel. |

---

## Connexions (réseau)

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **ConnectionService** (ou équivalent) | `users/services/connection/` | Demandes de connexion, acceptation, refus, liste (user_connection). |

---

## Modération

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **UserBlockService** | `users/services/moderation/user-block.service.interface.ts` (et impl) | Blocage / déblocage (user_block). Cache éventuel : `user-block-cache.ts`. |
| **UserReport** (repository + logique) | `users/repositories/moderation/user-report.repository.ts` | Signalements (user_report). Routers tRPC : `userBlock.*`, `userReport.*`. |

---

## Crédits

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **CreditService** | `credits/services/credit.service.ts` | Solde, historique des transactions (credit_transaction), TOP_UP / USAGE / REFUND. Intégration Polar (webhook) pour les achats. |

---

## Services externes

| Service | Fichier / zone | Rôle |
|---------|----------------|------|
| **EmailService** | `email/services/email.service.interface.ts` | Envoi d’emails (ex. Resend pour support). |
| **AuditLogService** | `common/audit-log.service.ts` | Écriture dans audit_log. |
| **Daily** | `daily/services/daily.service.ts` | API Daily.co (création de rooms, webhooks). |
| **Prometheus / metrics** | `metrics/prometheus.ts` | Exposition des métriques pour `/api/metrics`. |

---

## Routers tRPC (entrée publique)

Les routers exposent les procédures qui s’appuient sur ces services : `workshop`, `workshopFeedback`, `mentor`, `apprentice`, `connection`, `messaging`, `notification`, `userBlock`, `userReport`, `credits`, `user`, `cashbackAnalytics`, `accountSettings`. Détail des procédures dans chaque fichier sous `back/src/routers/`.
