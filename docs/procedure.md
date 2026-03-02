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
3. Copier les fichiers d’exemple d’env et renseigner les variables :
   - `back/.env` à partir de `back/.env.example`
   - `front/.env` à partir de `front/.env.example`
4. Synchroniser le schéma Prisma : `pnpm db:push`
5. Lancer l’app : `pnpm dev` (front :3001, back :3000 ou 4500 selon config).

Voir [README principal](../README.md) pour le détail des variables.

---

## Base de données

- **Dev (schéma à jour)** : `pnpm db:push` — applique le schéma Prisma sans créer de migration.
- **Changements récents** : modèle `user` remplacé par `account` + `app_user` (Better Auth) ; suppression de `session`, `conversation_pin`, `deletion_job`, `verification`, `workshop_cashback_queue` ; ajout de `magic_link_token` ; `audit_log` avec adminId/action/targetId/details.
- **Prod / migrations** : `pnpm db:migrate` — crée ou applique les migrations.
- **Régénérer le client Prisma** : `pnpm db:generate` (utile après modification du schéma).
- **Explorer les données** : `pnpm db:studio` — ouvre Prisma Studio.

Schéma et migrations : `back/prisma/schema/schema.prisma`.

---

## Authentification (Better Auth)

- **Back** : `BETTER_AUTH_SECRET` (min 32 caractères), `BETTER_AUTH_URL` (URL publique du back). Configuration dans le back (voir [back.md](back.md)).
- **Front** : `NEXT_PUBLIC_SERVER_URL` doit pointer vers le back. Le client utilise `/api/auth` sur cette URL.
- **CORS** : `CORS_ORIGIN` côté back doit inclure l’origine du front (ex. `http://localhost:3001`).

Rôles (MENTOR / APPRENANT / ADMIN) : choisis à l’onboarding via `/api/onboarding/select-role` pour MENTOR et APPRENANT ; ADMIN est attribué manuellement. Utilisés côté front pour la nav et l’affichage (ADMIN → interface `/admin`).

---

## Crons (jobs planifiés)

Les routes sous `back/src/app/api/cron/*` sont prévues pour être appelées par un planificateur externe (cron système, GitHub Actions, etc.) avec le header ou paramètre contenant `CRON_SECRET`.

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

- **Tests unitaires** : `pnpm run test:unit` (à la racine). Les jobs CI s’attendent à ce script. À définir dans `package.json` si absent (ex. via Jest ou Vitest sur `front/` et `back/`).
- **Tests d’intégration** : `pnpm run test:integration`. Idem, prévu par la CI.
- **E2E (Cypress)** : configuration à la racine dans `cypress.config.js`. Les specs sont attendues dans `cypress/e2e/` (ex. `cypress/e2e/**/*.cy.{js,ts}`) et `cypress/e2e/smoke/` pour les smoke tests. En CI, Cypress est lancé après le build ; en local, lancer l’app puis exécuter Cypress selon la config du projet.

Emplacements typiques des tests (à adapter selon le framework) :
- **Front** : `front/src/**/__tests__/*.test.ts(x)` ou `*.spec.ts(x)`.
- **Back** : `back/src/**/__tests__/*.test.ts` ou `*.spec.ts`.
- **E2E** : `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`.

Résultats et artefacts (coverage, junit, screenshots/videos Cypress) sont publiés par la CI. Voir le workflow pour les chemins exacts.

---

## Déploiement

- **Build** : `pnpm build` (Turborepo build front + back).
- **Back** : le point d’entrée en prod est le serveur custom (`back/server.ts`), pas `next start` seul. Variables d’env à définir sur l’hébergeur (voir `back/.env.example`).
- **Front** : build Next.js, puis `next start` ou hébergement statique selon config. `NEXT_PUBLIC_SERVER_URL` doit pointer vers l’URL publique du back.
- **CI/CD** : workflows dans `.github/workflows/` (tests, code-quality, deployment). Adapter les secrets et les étapes selon l’environnement cible.

---

## Documentation

- [Architecture](architecture.md)
- [Front](front.md)
- [Back](back.md)
- [Référence](reference.md)
