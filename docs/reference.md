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
- **Flux paiement/crédits** : achat Polar, webhook, crédit compte.
- **Flux messagerie** : getOrCreateConversation, envoi (tRPC/Socket), temps réel.
- **Flux visio** : Daily.co token, webhook, crons.
- **Flux suppression compte** : demande, deletion_job, purge cron.
- **Flux crons** : liste des jobs planifiés.
- **Flux réseau** : connexions mentor-apprenant.
- **Arborescence** : structure macro et micro (front, back) : [arborescence.md](arborescence.md).

---

## Front

- Structure app, stack, routes, auth, sidebar : [front.md](front.md).
- Schémas : layout/Providers, flux tRPC, nav sidebar, auth/profil.
- Racine code : `front/src/` — `app/`, `components/`, `lib/`, `hooks/`, `types/`, `utils/trpc.ts`. Validation et types partagés : package `shared/` (voir [arborescence](arborescence.md)).

---

## Back

- Entrée requêtes, routers tRPC, structure dossiers, routes API, env : [back.md](back.md).
- Schémas : routage HTTP, arborescence appRouter, structure back/, flux requête, regroupement routes API.
- Racine code : `back/` — `server.ts`, `src/app/api/`, `src/routers/`, `src/lib/`, `.prisma/schema/`. Voir [arborescence](arborescence.md).

---

## API (tRPC)

- Router racine : `back/src/routers/index.ts` (appRouter).
- **Renommage** : `workshopFeedback.dismissReport` → `approveFeedback`.
- Sous-routers : auth, workshop, workshopFeedback, cashbackAnalytics, mentor, apprentice, connection, community, messaging, notification, userBlock, userReport, credits, user, accountSettings, admin, support.
- **admin** : `getStats`, `getOnboardingQueue`, `getUsers`, `approveUser`, `rejectUser`, `getUser360`, `updateUserCredits`, `bulkApproveUsers`, `bulkRejectUsers`, `sendBulkNotification` (moteur de segmentation).
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

- Schéma : `back/.prisma/schema/schema.prisma`.
- **MPD (modèle physique)** : [mpd.md](mpd.md) — tables, colonnes, types, clés, index.
- Modèles principaux : account, app_user (profil utilisateur, lié à account via userId), workshop, workshop_request, mentor_feedback, user_connection, conversation, message, message_reaction, notification, user_block, user_report, support_request, credit_transaction, audit_log (action, adminId, targetId, details), magic_link_token, workshop_cashback_queue, student_deal, community_spot, community_event, community_poll, poll_vote.
- Client généré : `back/.prisma/generated/client`.

---

## Variables d’environnement

- **Back** : `CORS_ORIGIN`, `CRON_SECRET`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_*`, `DAILY_*`, `POLAR_*` (paiement), `PORT_BACKEND`, `HOSTNAME_BACKEND`. Voir `back/.env.example`.
- **Front** : `NEXT_PUBLIC_SERVER_URL`. Voir `front/.env.example`.

---

## Scripts (racine repo)

- `pnpm dev` — front + back
- `pnpm dev:front` / `pnpm dev:back`
- `pnpm build` — build des workspaces
- `pnpm check-types`
- `pnpm db:push` / `pnpm db:migrate` / `pnpm db:generate` / `pnpm db:studio`
- `pnpm test:coverage` — tests avec couverture (Vitest, LCOV pour SonarQube)

### Tests

- `pnpm run test:unit` — tests unitaires (Vitest, front + back). Attendu par la CI.
- `pnpm run test:integration` — tests d’intégration (attendu par la CI).
- `pnpm run test:coverage` — tests avec couverture (rapports HTML + LCOV dans `coverage/`).
- E2E : Cypress, config dans `cypress.config.js`, specs dans `cypress/e2e/`.

Emplacements : `front/__tests__/units/`, `back/__tests__/units/`, `back/__tests__/api/`, `back/__tests__/trpc/`, `back/__tests__/integration/`. Détail : [procedure.md](procedure.md) § Lancer les tests.

---

## Glossaire

- **Apprenant** — Utilisateur avec le rôle APPRENANT : peut s’inscrire à des ateliers, envoyer des demandes, participer aux sessions visio, recevoir du cashback.
- **Atelier** — Synonyme de *workshop* : session d’apprentissage (souvent en visio) créée par un mentor, à laquelle des apprenants peuvent s’inscrire.
- **Cashback** — Remboursement ou crédit accordé à un apprenant après participation à un atelier (règles métier dans le back).
- **Mentor** — Utilisateur avec le rôle MENTOR : crée et anime des ateliers, a un profil publié (bio, domaines, disponibilités), reçoit des demandes d’inscription et des feedbacks.
- **Admin** : Utilisateur avec le rôle ADMIN : accès à l’interface `/admin` (modération, signalements, support threadé, onboarding, audit logs, Fiche 360°, notifications segmentées, création directe de contenu, bulk actions).
- **Workshop** : Atelier : entité métier (titre, date, mentor, statut, inscriptions, visio Daily). Voir modèles `workshop`, `workshop_request`, `mentor_feedback` dans le schéma Prisma.
- **Fiche 360°** : Vue centralisée de l'historique d'un utilisateur (ateliers, crédits, modération, audit log).
- **Moteur de segmentation** : Outil d'envoi de notifications groupées selon des critères spécifiques (rôle, activité, statut).

---

## Procédures pas à pas

Pour les guides (premier démarrage, DB, auth, crons, déploiement) : [procedure.md](procedure.md).

---

## Index doc

[README](README.md) — sommaire de la documentation.
