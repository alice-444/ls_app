# Référence — Détails techniques par domaine

Référence rapide par domaine : où trouver le code, quelles API, quels modèles.

---

## Architecture & flux

- Vue d’ensemble système, flux, modèles de données : [architecture.md](architecture.md).
- Schémas : système (front/back/DB), séquence des échanges, ER Prisma.
- **Flux d'authentification** : inscription, connexion (email/mot de passe, magic link), récupération mot de passe, onboarding.
- **Flux utilisateur** : états (non connecté → session → onboarding → dashboard), redirections par rôle (ADMIN/MENTOR/APPRENANT), RoleGate.
- **Flux de données** : tRPC + TanStack Query, contexte session, procédures protégées, Socket.IO temps réel.
- **Flux atelier** : création, publication, demande, acceptation, visio, feedback, cashback.
- **Interactions Mentor-Apprenant** : Accès au `MiniProfileModal` depuis `WorkshopRequestCard` et `WorkshopParticipantsCard`.
- **Flux paiement/crédits** : achat Polar, webhook, crédit compte.
- **Flux messagerie** : getOrCreateConversation, envoi (tRPC/Socket), temps réel.
- **Flux visio** : Daily.co (création salle cron ou `getDailyToken`, `nbf`/`exp` sur le créneau), masquage `dailyRoomId` jusqu’à ~3 h avant, token, webhook, crons nettoyage.
- **Flux suppression compte** : demande, deletion_job, purge cron.
- **Flux crons** : liste des jobs planifiés.
- **Flux réseau** : connexions mentor-apprenant.
- **Arborescence** : structure macro et micro (front, back) : [arborescence.md](arborescence.md).

---

## Front

- Structure app, stack, routes, auth, sidebar : [app.md](app.md).
- Schémas : layout/Providers, flux tRPC, nav sidebar, auth/profil.
- Racine code : `app/src/` — `app/`, `components/`, `lib/`, `hooks/`, `types/`, `utils/trpc.ts`. Validation et types partagés : package `shared/` (voir [arborescence](arborescence.md)).

---

## Back

- Entrée requêtes, routers tRPC, structure dossiers, routes API, env : [back.md](back.md).
- Schémas : routage HTTP, arborescence appRouter, structure du package `app/`, flux requête, regroupement routes API.
- Racine code API + front : package **`app/`** — `server.ts`, `src/app/api/`, `src/routers/`, `src/lib/`, `prisma/schema/`. Voir [arborescence](arborescence.md).

---

## API (tRPC)

- Router racine : `app/src/routers/index.ts` (appRouter).
- **Renommage** : `workshopFeedback.dismissReport` → `approveFeedback`.
- Sous-routers : auth, workshop, workshopFeedback, cashbackAnalytics, mentor, apprentice, connection, community, messaging, notification, userBlock, userReport, credits, user, accountSettings, admin, support.
- **admin** : `getStats`, `getAnalytics` (BI / période `7d` \| `30d` \| `90d` \| `all`), `getOnboardingQueue`, `getUsers`, `approveUser`, `rejectUser`, `getUser360`, `updateUserCredits`, `bulkApproveUsers`, `bulkRejectUsers`, `sendBulkNotification` (moteur de segmentation). Les événements métier côté serveur peuvent notifier les admins en Socket (`admin:new-notification`) via `NotificationService.notifyAdmin` / `SocketNotificationEventEmitter.emitAdminNotification`.
- **community** : `getHubData`, `voteInPoll`, propositions, modération (dont `bulkReviewProposals`), création directe (`createDeal`, `createEvent`, etc.).
- **support** : création, suivi, et système threadé (`addMessage`).
- Procédures : `publicProcedure` (sans session), `protectedProcedure` (session requise), `mentorProcedure` (MENTOR actif), `adminProcedure` (ADMIN actif, audit log).
- Point d’entrée HTTP : `/trpc` (POST batch).

---

## API (routes REST / custom)

- Auth : `/api/auth/*` (Better Auth), `/api/auth/magic-link-callback`, `/api/sign-up`, `/api/sign-in`.
- Onboarding : `/api/onboarding/select-role`.
- Profil : `/api/profile/role`, `/api/profile/role/mentor`, `/api/profile/upload-photo`, `/api/profile/photo/[filename]`, `/api/profile/publish`, `/api/profile/delete`.
- Support : `/api/support-request`, `/api/support-request/attachments/[filename]`.
- Crons : `/api/cron/*` (à appeler avec CRON_SECRET).
- Webhooks : `/api/daily/webhook`, `/api/polar/webhook`.
- Métriques : `/api/metrics` (Prometheus).

---

## Base de données (Prisma)

- Schéma : `app/prisma/schema/schema.prisma`.
- **MPD (modèle physique)** : [mpd.md](mpd.md) — tables, colonnes, types, clés, index.
- Modèles principaux : account, app_user (profil utilisateur, lié à account via userId), workshop, workshop_request, mentor_feedback, user_connection, conversation, message, message_reaction, notification, user_block, user_report, support_request, credit_transaction, audit_log (action, adminId, targetId, details), magic_link_token, workshop_cashback_queue, student_deal, community_spot, community_event, community_poll, poll_vote.
- Client généré : `app/prisma/generated/client` (sortie définie dans le `generator` Prisma).

---

## Variables d’environnement

- **Fichier d’exemple commité** : `app/.env.example` (surtout `NEXT_PUBLIC_*`). Les secrets se configurent dans **`app/.env`** (non versionné) : typiquement `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `CRON_SECRET`, `RESEND_*`, `DAILY_*`, `DAILY_WEBHOOK_SECRET`, `POLAR_*` (webhook + clés produit), `PORT_BACKEND` / `HOSTNAME_BACKEND` si utilisés par `server.ts`, `CLOUDINARY_*` si stockage cloud des photos, `SENTRY_*` si activé.
- **Règles métier, Polar, rate limits, dépannage** : [metier-et-ops.md](metier-et-ops.md).

---

## Scripts (racine repo)

- `pnpm dev` — workspace `app` (Turborepo)
- `pnpm dev:app` — filtre sur le package `app`
- `pnpm build` — build des workspaces
- `pnpm check-types`
- `pnpm db:push` / `pnpm db:migrate` / `pnpm db:generate` / `pnpm db:studio`
- `pnpm test:coverage` — tests avec couverture (Vitest, LCOV pour SonarQube)

### Tests

- `pnpm run test:unit` — tests unitaires (Vitest, front + back). Attendu par la CI.
- Tests d’intégration / E2E : suivre les workflows dans `.github/workflows/` (le root `package.json` peut n’avoir que `pnpm test`).
- `pnpm run test:coverage` — tests avec couverture (rapports HTML + LCOV dans `coverage/`).
- E2E : Cypress, config dans `cypress.config.js`, specs dans `cypress/e2e/`.

Emplacements : principalement `app/__tests__/units/`. Détail : [procedure.md](procedure.md) § Lancer les tests et [metier-et-ops.md](metier-et-ops.md) § Tests.

---

## Glossaire

- **Apprenant** — Utilisateur avec le rôle APPRENANT : peut s’inscrire à des ateliers, envoyer des demandes, participer aux sessions visio, recevoir du cashback.
- **Atelier** — Synonyme de *workshop* : session d’apprentissage (souvent en visio) créée par un mentor, à laquelle des apprenants peuvent s’inscrire.
- **Cashback** — Remboursement ou crédit accordé à un apprenant après participation à un atelier (règles métier dans le back).
- **Mentor** — Utilisateur avec le rôle MENTOR : crée et anime des ateliers, a un profil publié (bio, domaines, disponibilités), reçoit des demandes d’inscription et des feedbacks.
- **Admin** : Utilisateur avec le rôle ADMIN : accès à l’interface `/admin` (analyses BI, modération, signalements, support threadé, onboarding, audit logs, Fiche 360°, notifications segmentées, alertes temps réel Socket, création directe de contenu, bulk actions).
- **Workshop** : Atelier : entité métier (titre, date, mentor, statut, inscriptions, visio Daily). Voir modèles `workshop`, `workshop_request`, `mentor_feedback` dans le schéma Prisma.
- **Fiche 360°** : Vue centralisée de l'historique d'un utilisateur (ateliers, crédits, modération, audit log).
- **Moteur de segmentation** : Outil d'envoi de notifications groupées selon des critères spécifiques (rôle, activité, statut).

---

## Procédures pas à pas

Pour les guides (premier démarrage, DB, auth, crons, déploiement) : [procedure.md](procedure.md).

---

## Index doc

[README](README.md) — sommaire de la documentation.  
[metier-et-ops.md](metier-et-ops.md) — crédits, Polar, communauté, admin, rate limiting, dépannage.
