# Référence — Détails techniques par domaine

Référence rapide par domaine : où trouver le code, quelles API, quels modèles.

---

## Architecture & flux

- Vue d’ensemble système, flux, modèles de données : [architecture.md](architecture.md).
- Schémas : système (front/back/DB), séquence des échanges, ER Prisma.

---

## Front

- Structure app, stack, routes, auth, sidebar : [front.md](front.md).
- Schémas : layout/Providers, flux tRPC, nav sidebar, auth/profil.
- Racine code : `front/src/` — `app/`, `components/`, `lib/`, `utils/trpc.ts`, `shared/`.

---

## Back

- Entrée requêtes, routers tRPC, structure dossiers, routes API, env : [back.md](back.md).
- Schémas : routage HTTP, arborescence appRouter, structure back/, flux requête, regroupement routes API.
- Racine code : `back/` — `server.ts`, `src/app/api/`, `src/routers/`, `src/lib/`, `prisma/schema/`.

---

## API (tRPC)

- Router racine : `back/src/routers/index.ts` (appRouter).
- Sous-routers : workshop, workshopFeedback, cashbackAnalytics, mentor, apprentice, connection, messaging, notification, userBlock, userReport, credits, user, accountSettings.
- Procédures : `publicProcedure` (sans session), `protectedProcedure` (session Better Auth requise).
- Point d’entrée HTTP : `/trpc` (POST batch).

---

## API (routes REST / custom)

- Auth : `/api/auth/*` (Better Auth), `/api/sign-up`, `/api/sign-in`.
- Onboarding : `/api/onboarding/select-role`.
- Profil : `/api/profile/role`, `/api/profile/role/prof`, `/api/profile/upload-photo`, `/api/profile/photo/[filename]`, `/api/profile/publish`, `/api/profile/delete`.
- Support : `/api/support-request`, `/api/support-request/attachments/[filename]`.
- Crons : `/api/cron/*` (à appeler avec CRON_SECRET).
- Webhooks : `/api/daily/webhook`, `/api/polar/webhook`.
- Métriques : `/api/metrics` (Prometheus).

---

## Base de données (Prisma)

- Schéma : `back/prisma/schema/schema.prisma`.
- Modèles principaux : user, account, session, app_user, workshop, workshop_request, mentor_feedback, workshop_cashback_queue, user_connection, conversation, message, message_reaction, conversation_pin, notification, user_block, user_report, support_request, credit_transaction, audit_log, deletion_job, verification.
- Client généré : `back/prisma/generated/client`.

---

## Variables d’environnement

- **Back** : `CORS_ORIGIN`, `CRON_SECRET`, `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_*`, `DAILY_*`, `STRIPE_*` (optionnel), `PORT_BACKEND`, `HOSTNAME_BACKEND`. Voir `back/.env.example`.
- **Front** : `NEXT_PUBLIC_SERVER_URL`. Voir `front/.env.example`.

---

## Scripts (racine repo)

- `pnpm dev` — front + back
- `pnpm dev:front` / `pnpm dev:back`
- `pnpm build` — build des workspaces
- `pnpm check-types`
- `pnpm db:push` / `pnpm db:migrate` / `pnpm db:generate` / `pnpm db:studio`

### Tests

- `pnpm run test:unit` — tests unitaires (attendu par la CI ; à définir dans `package.json` si besoin).
- `pnpm run test:integration` — tests d’intégration (attendu par la CI).
- E2E : Cypress, config dans `cypress.config.js`, specs dans `cypress/e2e/` et `cypress/e2e/smoke/`.

Détail et emplacements des tests : [procedure.md](procedure.md) § Lancer les tests.

---

## Glossaire

- **Apprenant** — Utilisateur avec le rôle APPRENANT : peut s’inscrire à des ateliers, envoyer des demandes, participer aux sessions visio, recevoir du cashback.
- **Atelier** — Synonyme de *workshop* : session d’apprentissage (souvent en visio) créée par un mentor, à laquelle des apprenants peuvent s’inscrire.
- **Cashback** — Remboursement ou crédit accordé à un apprenant après participation à un atelier (règles métier dans le back ; file de traitement : `workshop_cashback_queue`).
- **Mentor** — Utilisateur avec le rôle MENTOR : crée et anime des ateliers, a un profil publié (bio, domaines, disponibilités), reçoit des demandes d’inscription et des feedbacks.
- **Workshop** — Atelier : entité métier (titre, date, mentor, statut, inscriptions, visio Daily). Voir modèles `workshop`, `workshop_request`, `mentor_feedback` dans le schéma Prisma.

---

## Procédures pas à pas

Pour les guides (premier démarrage, DB, auth, crons, déploiement) : [procedure.md](procedure.md).

---

## Index doc

[README](README.md) — sommaire de la documentation.
