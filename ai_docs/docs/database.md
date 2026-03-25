# LearnSup – Schéma de base de données

Référence pour l’IA. Schéma complet : `back/.prisma/schema/schema.prisma`. Migrations dans `back/.prisma/migrations/`.

---

## Tables principales

### Auth (Better Auth)

| Modèle | Rôle |
|--------|------|
| **user** | Utilisateur Better Auth : id, name, username, email, emailVerified, image, title, isDisabled, deletedAt. Liens : account[], session[], app_user. |
| **account** | Compte (provider, password, tokens). userId → user. |
| **session** | Session : token, userId, expiresAt, ipAddress, userAgent. |
| **verification** | Tokens de vérification (email, etc.). |

### Métier

| Modèle | Rôle |
|--------|------|
| **app_user** | Profil applicatif : id, userId (→ user), role (MENTOR | APPRENANT | ADMIN), status (ACTIVE | SUSPENDED | PENDING), bio, photoUrl, domain, areasOfExpertise, mentorshipTopics, qualifications, experience, socialMediaLinks, displayName, iceBreakerTags, studyDomain, studyProgram, isPublished, publishedAt, creditBalance, isOnline, lastSeen, champs soft-delete (deletedAt, deletionRequestedAt, deletionReason). Relations : workshops (creator/apprentice), workshop_request (apprentice/mentor), user_connection, conversations, notifications, user_block, credit_transaction, mentor_feedback. |
| **workshop** | Atelier : id, title, description, date, time, location, isVirtual, maxParticipants, materialsNeeded, topic, status (DRAFT | PUBLISHED | CANCELLED | COMPLETED), creatorId (→ app_user), apprenticeId (optionnel, après acceptation), requestId (→ workshop_request), duration, creditCost, dailyRoomId, dailyRoomLastActivityAt, apprenticeAttendanceStatus (PENDING | PRESENT | NO_SHOW), publishedAt. Relations : workshop_request[], mentor_feedback[], conversation. |
| **workshop_request** | Demande d’atelier : id, title, description, message, preferredDate, preferredTime, status (PENDING | ACCEPTED | REJECTED | CANCELLED), apprenticeId, mentorId, workshopId (optionnel, une fois atelier créé). Relations : app_user (apprentice, mentor), workshop. |
| **mentor_feedback** | Avis sur un mentor : id, mentorId, apprenticeId, workshopId (optionnel), rating, comment, isAnonymous, status (ACTIVE | UNDER_REVIEW | DELETED), reportedAt, reportedBy, reportReason. Contrainte unique (apprenticeId, workshopId). |
| **workshop_cashback_queue** | File de cashback : workshopId, participantUserId, cashbackAmount, workshopEndTime, status (PENDING | PROCESSED | FAILED), processedAt, retryCount, errorMessage. |

### Réseau & messagerie

| Modèle | Rôle |
|--------|------|
| **user_connection** | Connexion entre utilisateurs : requesterId, receiverId, status (PENDING | ACCEPTED | REJECTED). Unique (requesterId, receiverId). |
| **conversation** | Conversation : participant1Id, participant2Id, workshopId (optionnel). Unique (participant1Id, participant2Id). Relations : messages[], conversation_pin. |
| **message** | Message : conversationId, senderId, content, isRead, replyToMessageId, editCount, deletedAt. Relations : reactions[]. |
| **message_reaction** | Réaction : messageId, userId, emoji. Unique (messageId, userId, emoji). |
| **conversation_pin** | Épinglage : conversationId, appUserId. Unique (conversationId, appUserId). |

### Notifications, modération, support, crédits

| Modèle | Rôle |
|--------|------|
| **notification** | Notification in-app : userId, type, title, message, isRead, actionUrl. |
| **user_block** | Blocage : blockerId, blockedId. Unique (blockerId, blockedId). |
| **user_report** | Signalement : reporterId, reportedId, reason (HARASSMENT | SPAM | INAPPROPRIATE_CONTENT | FAKE_PROFILE), details, messageId (optionnel), status (PENDING | REVIEWED | RESOLVED | DISMISSED), reviewedAt, reviewedBy, adminNotes. |
| **support_request** | Demande support : userId (optionnel), email, subject, description, problemType, status (PENDING | IN_PROGRESS | RESOLVED | CLOSED), attachments (Json). |
| **credit_transaction** | Transaction crédits : userId, amount, type (TOP_UP | USAGE | REFUND), description. |

### Technique

| Modèle | Rôle |
|--------|------|
| **audit_log** | Log : userId, type, meta (Json). |
| **deletion_job** | Job de suppression différée : userId, runAt, status (PENDING, etc.). Index sur runAt. |

---

## Enums

- **Role** : MENTOR, APPRENANT, ADMIN  
- **AppUserStatus** : ACTIVE, SUSPENDED, PENDING  
- **WorkshopStatus** : DRAFT, PUBLISHED, CANCELLED, COMPLETED  
- **WorkshopRequestStatus** : PENDING, ACCEPTED, REJECTED, CANCELLED  
- **AttendanceStatus** : PENDING, PRESENT, NO_SHOW  
- **CashbackStatus** : PENDING, PROCESSED, FAILED  
- **ConnectionStatus** : PENDING, ACCEPTED, REJECTED  
- **FeedbackStatus** : ACTIVE, UNDER_REVIEW, DELETED  
- **ReportReason** : HARASSMENT, SPAM, INAPPROPRIATE_CONTENT, FAKE_PROFILE  
- **ReportStatus** : PENDING, REVIEWED, RESOLVED, DISMISSED  
- **SupportRequestStatus** : PENDING, IN_PROGRESS, RESOLVED, CLOSED  
- **CreditTransactionType** : TOP_UP, USAGE, REFUND  

---

## Sécurité et intégrité

- **IDs** : `@id @map("_id")` (format cohérent type string/UUID).  
- **Cascade** : `onDelete: Cascade` sur la plupart des FK (user → app_user, app_user → workshop_request, conversation → message, etc.).  
- **Index** : index sur (userId, createdAt), (mentorId, status), (conversationId, createdAt), (status), etc. pour les requêtes courantes.  
- **Contraintes uniques** : (apprenticeId, workshopId) sur mentor_feedback, (requesterId, receiverId) sur user_connection, (participant1Id, participant2Id) sur conversation, (messageId, userId, emoji) sur message_reaction.  

Pour toute création ou modification de schéma, ajouter une migration Prisma et mettre à jour les services/repositories concernés.
