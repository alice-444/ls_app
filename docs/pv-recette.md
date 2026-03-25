# Procès-verbal de recette (PVR)

Document de recette formelle pour valider une livraison ou une fonctionnalité LearnSup.

---
**Stack** : Monorepo TypeScript (Next.js, Prisma, PostgreSQL) — Front :3001, Back :4500, Socket.IO :5050.

---

## Périmètre de la recette

### Objectif

Recette de l'application LearnSup : plateforme d'accompagnement mettant en relation mentors et apprenants via des ateliers, une messagerie temps réel et un hub communauté.

---

## Critères d'acceptation

| # | Critère | Résultat attendu | Statut |
|---|---------|-----------------|--------|
| 1 | **Inscription** — POST `/api/sign-up`, email bienvenue, lien `/onboarding` | Nouveau `account` + `user` en DB (status PENDING), email reçu, clic lien → page onboarding | OK |
| 2 | **Connexion** — email/mot de passe ou magic link (`trpc.auth.requestMagicLink`) | Session cookie créée, GET `/api/profile/role` retourne le rôle, redirection `/dashboard` ou `/admin` ou `/onboarding` selon rôle | OK |
| 3 | **Onboarding** — POST `/api/onboarding/select-role` (MENTOR ou APPRENANT) | `user.role` et `user.status = ACTIVE` en DB, redirection `/dashboard` | OK |
| 4 | **Création atelier** — mentor : `workshop.create` (DRAFT) puis `workshop.publish` | Atelier visible dans catalogue (`/mentors`, `/workshop/[id]`), status PUBLISHED | OK |
| 5 | **Demande atelier** — apprenant : `mentor.submitWorkshopRequest` | Débit 10 crédits (`credit_transaction` USAGE), `workshop_request` PENDING, notification mentor | OK |
| 6 | **Acceptation demande** — mentor : `mentor.acceptRequest` (date, lieu, visio) | `workshop` créé/mis à jour avec `apprenticeId`, `workshop_request` ACCEPTED, notification + email apprenant | OK |
| 7 | **Visio** — `workshop.getDailyToken` pour mentor ou apprenant | Token Daily.co retourné, redirection `/workshop/[id]/join-video`, salle créée si absente | OK |
| 8 | **Feedback** — apprenant : `workshopFeedback.submitFeedback` après atelier | `mentor_feedback` créé, cron `create-feedback-notifications` envoie notif mentor | OK |
| 9 | **Cashback** — cron `process-cashback-queue` | `workshop_cashback_queue` → PROCESSED, `credit_transaction` REFUND crédite l'apprenant | OK |
| 10 | **Messagerie** — `messaging.getOrCreateConversation`, `messaging.sendMessage` ou Socket `send-message` | Message persisté, broadcast Socket `new-message` reçu par l'autre participant en temps réel | OK |
| 11 | **Connexion mentor-apprenant** — `connection.sendConnectionRequest`, `acceptConnectionRequest` | `user_connection` ACCEPTED, messagerie et demande atelier débloquées entre les deux | OK |
| 12 | **Hub Communauté** — page `/community`, `community.getHubData`, `community.voteInPoll` | Events, deals, spots, sondages affichés ; vote enregistré (`poll_vote`) | OK |
| 13 | **Admin** — `admin.getUser360`, `admin.bulkApproveUsers`, `admin.sendBulkNotification` (segmentation) | Fiche 360° complète, actions en masse exécutées, audit_log tracé | OK |
| 14 | **Support** — formulaire → `support.createRequest`, `support.addMessage` (thread) | `support_request` + `support_message` créés, admin peut répondre dans le thread | OK |
| 15 | **Crédits** — `credits.createCheckoutSession` → Polar → webhook `/api/polar/webhook` | `credit_transaction` TOP_UP après paiement, solde mis à jour | OK |
| 16 | **Suppression compte** — DELETE `/api/profile/delete?reason=...` | `user.deletedAt` renseigné, auth désactivé, `deletion_job` créé (runAt = now + 30j) ; cron `purge-deletions` anonymise à échéance | OK |

---

## Annexes

- [ ] Captures d'écran
- [ ] Logs / rapports (`coverage/`, artefacts CI)
- [ ] [docs/README.md](README.md), [architecture](architecture.md), [procedure](procedure.md)

---

*Document : [procedure.md](procedure.md) — [README](README.md)*
