# Guides — Procédures LearnSup

Procédures pas à pas : environnement, base de données, auth, crons, déploiement.

---

## Premier démarrage

1. Cloner le repo et installer les dépendances :
   ```bash
   git clone https://github.com/votre-org/ls_app.git
   cd ls_app
   pnpm install
   ```
2. Créer la base PostgreSQL (ex. `createdb learnsup`).
3. Copier **`app/.env`** à partir de `app/.env.example` et renseigner les secrets (base, auth, crons, intégrations — voir [metier-et-ops.md](metier-et-ops.md)).
4. Synchroniser le schéma Prisma : `pnpm db:push`
5. Lancer l’app : `pnpm dev` (workspace `app` : Next + socket selon config).

Voir [README principal](../README.md) pour le détail des variables.

---

## Base de données

- **Dev (schéma à jour)** : `pnpm db:push` — applique le schéma Prisma sans créer de migration.
- **Prod / migrations** : `pnpm db:migrate` — crée ou applique les migrations.
- **Régénérer le client Prisma** : `pnpm db:generate` (utile après modification du schéma).
- **Explorer les données** : `pnpm db:studio` — ouvre Prisma Studio.

Schéma et migrations : `app/prisma/schema/schema.prisma`.

---

## Authentification (Better Auth)

- **Auth** : `BETTER_AUTH_SECRET` (min 32 caractères), `BETTER_AUTH_URL` (URL publique de l’app). Configuration dans `app` (voir [back.md](back.md)).
- **Client** : `NEXT_PUBLIC_SERVER_URL` / URLs publiques selon déploiement. Le client utilise les routes `/api/auth` de la même app Next.
- **CORS** : `CORS_ORIGIN` doit inclure l’origine du navigateur (ex. `http://localhost:3001`).

Rôles (MENTOR / APPRENANT / ADMIN) : choisis à l’onboarding via `/api/onboarding/select-role` pour MENTOR et APPRENANT ; ADMIN est attribué manuellement. Utilisés côté front pour la nav et l’affichage (ADMIN → interface `/admin`).

---

## Crons (jobs planifiés)

Les routes sous `app/src/app/api/cron/*` sont prévues pour être appelées par un planificateur externe (cron système, GitHub Actions, etc.) avec le header ou paramètre contenant `CRON_SECRET`.

Exemples de routes :
- `generate-video-links` — génération des liens visio (Daily).
- `cleanup-inactive-rooms` — nettoyage des salles inactives.
- `process-cashback-queue` — traitement de la file cashback.
- `retry-failed-cashbacks` — nouvelle tentative des cashbacks en échec.
- `create-feedback-notifications` — créations de notifs feedback.
- `purge-deletions` — purge des comptes en cours de suppression.
- `check-cashback-integrity` — vérification de l’intégrité des cashbacks.

---

## Lancer les tests

La CI (`.github/workflows/tests.yml`) exécute des tests unitaires, d’intégration et E2E. En local, les scripts doivent être définis à la racine (ou dans les workspaces).

- **Tests unitaires** : `pnpm run test:unit`  (Vitest, front + back via Turbo).
- **Tests avec couverture** : `pnpm run test:coverage` (rapports HTML + LCOV dans `coverage/`).
- **Tests d'intégration** : voir `.github/workflows/` — le dépôt racine n’expose pas forcément `test:integration` dans `package.json` ; la CI peut invoquer Vitest ou d’autres cibles.
- **E2E (Cypress)** : configuration à la racine dans `cypress.config.js`. Les specs sont attendues dans `cypress/e2e/` (ex. `cypress/e2e/**/*.cy.{js,ts}`) et `cypress/e2e/smoke/` pour les smoke tests. En CI, Cypress est lancé après le build ; en local, lancer l’app puis exécuter Cypress selon la config du projet.

Emplacements des tests :
- **Vitest (package app)** : `app/__tests__/units/**/*.test.{ts,tsx}` (services, hooks, validation partagée, etc.)
- **E2E** : `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`.

Résultats et artefacts (coverage, junit, screenshots/videos Cypress) sont publiés par la CI. Voir le workflow pour les chemins exacts.

---

## Déploiement

- **Build** : `pnpm build` (Turborepo → package `app`).
- **Runtime** : le point d’entrée en prod est **`app/server.ts`** (`pnpm start` → `tsx server.ts`), qui monte Next + Socket.IO selon la config — pas un simple `next start` isolé. Variables d’env sur l’hébergeur : voir `app/.env.example` + secrets.
- **URLs publiques** : `NEXT_PUBLIC_*` alignées sur l’URL réelle servie aux navigateurs.
- **CI/CD** : workflows dans `.github/workflows/` (tests, code-quality, deployment). Adapter les secrets et les étapes selon l’environnement cible.

**Schéma et procédure détaillés** : [deploiement.md](deploiement.md) — architecture Docker, CI/CD, variables d’env, procédure de déploiement.

---

## Documentation

- [Architecture](architecture.md)
- [Déploiement](deploiement.md)
- [App](app.md)
- [Back](back.md)
- [Référence](reference.md)
