# Stack technique et choix technologiques — LearnSup

Document de référence pour les technologies, langages et outils utilisés dans le projet. Mise à jour régulière pour refléter l’état actuel du monorepo.

---

## Langages


| Langage        | Version        | Usage                                                                                        |
| -------------- | -------------- | -------------------------------------------------------------------------------------------- |
| **TypeScript** | 5.9+           | Langage principal du projet. Typage statique pour le front, le back et les schémas partagés. |
| **JavaScript** | ES2022+        | Cible de compilation TypeScript. Pas de code JS brut dans le projet.                         |
| **SQL**        | PostgreSQL 14+ | Requêtes générées par Prisma. Schéma et migrations dans `back/prisma/schema/`.               |
| **CSS**        | Tailwind 4     | Styles via classes utilitaires. Variables CSS pour le thème (couleurs, typographie).         |


**Choix TypeScript** : Typage fort pour réduire les erreurs à la compilation, inférence de types pour tRPC (end-to-end type-safety), meilleure DX avec l’IDE. Alternative à JavaScript pur : évite les erreurs à l’exécution (null, types incorrects), refactoring plus sûr, documentation vivante via les types. Indispensable pour tRPC.

---

## Core (monorepo)


| Technologie   | Version | Rôle                                                                   |
| ------------- | ------- | ---------------------------------------------------------------------- |
| **Node.js**   | v20+    | Runtime JavaScript/TypeScript.                                         |
| **pnpm**      | 10.30+  | Gestionnaire de paquets. Workspaces pour le monorepo.                  |
| **Turborepo** | 2.8+    | Orchestration des tâches (build, test, dev). Cache incrémental.        |
| **Next.js**   | 16.1+   | Framework full-stack React. App Router, API Routes, Server Components. |


**Choix monorepo** : Partage de types, validation (Zod) et constantes entre front et back. Un seul `pnpm install` à la racine.

**Choix pnpm** : Plus rapide que npm/yarn, économie d'espace disque (store global), workspaces natifs. `pnpm-lock.yaml` déterministe pour des builds reproductibles.

**Choix Turborepo** : Cache distant des tâches (build, test), parallélisation intelligente, détection des dépendances entre packages. Réduit drastiquement le temps de CI.

**Choix Next.js** : Full-stack (API + front), App Router moderne, écosystème mature (Vercel, communauté). Alternative à Vite + Express : tout-en-un, moins de configuration. SSR/SSG possibles si besoin SEO.

---

## Frontend


| Technologie             | Version  | Rôle                                                               |
| ----------------------- | -------- | ------------------------------------------------------------------ |
| **React**               | 19.2+    | Bibliothèque UI. Hooks, Server Components (si utilisés).           |
| **Next.js**             | 16.1+    | App Router, routing, SSR/SSG.                                      |
| **TanStack Query**      | 5.90+    | Cache, synchronisation des données serveur.                        |
| **tRPC**                | 11.12+   | API type-safe. Client React avec hooks `useQuery` / `useMutation`. |
| **Better Auth**         | 1.5+     | Client d’authentification (session, login, magic link).            |
| **Zod**                 | 4.3+     | Validation des formulaires et schémas partagés.                    |
| **React Hook Form**     | 7.71+    | Gestion des formulaires.                                           |
| **TanStack Form**       | 1.28+    | Formulaires complexes (profil mentor, etc.).                       |
| **Tailwind CSS**        | 4.2+     | Styles utilitaires. Design tokens via `@theme`.                    |
| **shadcn/ui**           | Radix UI | Composants accessibles (boutons, dialogs, inputs, etc.).           |
| **Framer Motion**       | 12.35+   | Animations.                                                        |
| **Socket.IO client**    | 4.8+     | Temps réel (messagerie, notifications).                            |
| **Daily.co (daily-js)** | 0.87+    | Visioconférence pour les ateliers.                                 |
| **Lucide React**        | 0.577+   | Icônes.                                                            |
| **Sonner**              | 2.0+     | Toasts.                                                            |
| **next-themes**         | 0.4+     | Thème clair/sombre.                                                |


**Choix tRPC** : Pas de génération de client séparée. Types partagés automatiquement entre back et front. Réduction des erreurs d’API. Alternative à REST : pas de contrat OpenAPI à maintenir, pas de désync types. Alternative à GraphQL : plus simple, pas de sur-fetch/sous-fetch.

**Choix Tailwind + shadcn/ui + Framer Motion** (styles, UI, animations) : **Tailwind 4** — approche utility-first — classes atomiques (`flex`, `p-4`, `text-lg`) composées directement dans le JSX, sans écrire de CSS personnalisé. Configuration via `@theme` (design tokens : couleurs, typographie, breakpoints). Purge automatique : seules les classes utilisées sont incluses dans le bundle final (taille minimale). Responsive et dark mode natifs. Alternative à CSS-in-JS (styled-components, emotion) : pas de runtime, pas de problème d'hydratation, bundle plus léger. Alternative à CSS modules : cohérence design system globale, pas de duplication de styles. Alternative à Bootstrap. **shadcn/ui** — philosophie copy-paste — les composants sont copiés dans le projet (`components/ui/`), pas installés comme dépendance opaque. On possède le code, on peut le modifier directement. Basé sur **Radix UI** : accessibilité WCAG (ARIA, keyboard navigation, focus management), primitives headless testées. Composants légers (Button, Dialog, Input, Select, etc.), stylés avec Tailwind. Alternative à MUI : pas de theme provider complexe, personnalisation sans `sx` ou override de classes, bundle plus léger. Alternative à Chakra : Radix plus mature pour l'accessibilité. Alternative à Ant Design. **Framer Motion** — animations déclaratives, performantes (GPU), support reduced-motion. Les trois forment une chaîne cohérente : Tailwind pour le style, shadcn pour les composants, Framer pour le mouvement.

**Choix TanStack Query** : Cache automatique, invalidation, retry, états loading/error. Alternative à SWR : plus de fonctionnalités. Évite le state manuel pour les données serveur.

**Choix Better Auth** : Solution d’authentification full-stack pensée pour Next.js et TypeScript. Alternative à NextAuth : bundle plus léger, API plus simple, magic link en natif (sans plugin). Sessions stockées en base (Prisma), cookies httpOnly sécurisés. Extensible via plugins (OAuth, 2FA, etc.). Voir justification détaillée dans Backend.

---

## Backend


| Technologie               | Version        | Rôle                                                                   |
| ------------------------- | -------------- | ---------------------------------------------------------------------- |
| **Next.js**               | 16.1+          | API Routes, handler HTTP.                                              |
| **Prisma**                | 7.4+           | ORM TypeScript. Client généré, migrations.                             |
| **PostgreSQL**            | 14+            | Base de données relationnelle.                                         |
| **tRPC**                  | 11.12+         | API type-safe. Routers, procédures (public, protected, mentor, admin). |
| **Better Auth**           | 1.5+           | Authentification (sessions, stratégies, magic link).                   |
| **Zod**                   | 4.3+           | Validation des entrées (routers, schémas partagés).                    |
| **Resend**                | 6.9+           | Envoi d’emails transactionnels.                                        |
| **React Email**           | 2.0+           | Templates d’emails (HTML) en React.                                    |
| **Sharp**                 | 0.34+          | Traitement d’images (photos de profil).                                |
| **Socket.IO**             | 4.8+           | Serveur temps réel (messagerie, notifications).                        |
| **Daily.co**              | API + webhooks | Création de salles visio, webhooks présence.                           |
| **Polar**                 | API + webhooks | Paiement (crédits). Webhook checkout.                                  |
| **rate-limiter-flexible** | 9.1+           | Limitation de requêtes.                                                |
| **prom-client**           | 15.1+          | Métriques Prometheus (`/api/metrics`).                                 |
| **DOMPurify**             | 3.3+           | Nettoyage HTML (sécurité).                                             |
| **tsx**                   | 4.21+          | Exécution TypeScript (serveur, scripts).                               |


**Choix Prisma** : ORM type-safe, migrations versionnées, Prisma Studio pour l’exploration. Support PostgreSQL natif. Alternative à Drizzle : écosystème plus mature. Alternative à TypeORM : API plus simple. Client généré = types à jour avec le schéma.

**Choix Better Auth** : Authentification full-stack type-safe, conçue pour Next.js et Prisma. **Pourquoi Better Auth plutôt que NextAuth** : (1) plus léger et moins de configuration — pas d’adapter complexe, schéma Prisma natif (tables `user`, `session`, `account`, `verification`) ; (2) magic link en natif — flux passwordless sans plugin, idéal pour réduire la friction d’inscription ; (3) sessions en base — stockage PostgreSQL via Prisma, cookies httpOnly, invalidation et révocation simples ; (4) extensible — plugins OAuth (Google, GitHub), 2FA, organisation, etc. ; (5) TypeScript first — types générés, inférence end-to-end. Alternative à Auth.js/NextAuth : moins de couches d’abstraction, API plus directe. Alternative à Clerk/Supabase Auth : self-hosted, pas de dépendance à un fournisseur externe, données utilisateur dans notre base.

**Choix Socket.IO** : Temps réel bidirectionnel (messagerie, notifications). Alternative à WebSockets purs : fallback, rooms, reconnection. Alternative à Pusher/Ably : self-hosted, pas de coût externe.

**Choix Daily.co** : API simple pour salles visio, webhooks présence. Alternative à Twilio : moins de configuration. Alternative à Jitsi : hébergé, pas de serveur à maintenir.

**Choix Polar** : Paiement pour développeurs (crédits). Alternative à Stripe : interface plus simple pour cas "crédits". Webhooks pour synchroniser les achats.

**Choix Resend** : API email moderne, bon délivrabilité. React Email pour les templates. Alternative à Nodemailer : pas de config SMTP complexe.

**Choix Zod** : Schémas partagés front/back, inférence TypeScript. Alternative à Yup : plus léger. Validation à l'exécution = sécurité des entrées.

---

## Base de données


| Technologie    | Version | Rôle                                    |
| -------------- | ------- | --------------------------------------- |
| **PostgreSQL** | 14+     | SGBD relationnel.                       |
| **Prisma**     | 7.4+    | ORM, schéma, migrations, client généré. |


**Choix PostgreSQL** : Fiabilité, support JSON (JSONB), full-text search, transactions ACID. Alternative à MySQL : meilleur support des types avancés, pas de silos (Oracle). Alternative à SQLite : multi-utilisateurs, concurrence. Hébergement courant (Supabase, Neon, Railway, PlanetScale).

---

## Tests


| Technologie                     | Version | Rôle                                                |
| ------------------------------- | ------- | --------------------------------------------------- |
| **Vitest**                      | 4.0+    | Framework de tests unitaires (compatible Vite/ESM). |
| **@vitest/coverage-v8**         | 4.0+    | Couverture de code (provider V8).                   |
| **@testing-library/react**      | 16.3+   | Tests de composants React.                          |
| **@testing-library/jest-dom**   | 6.9+    | Matchers DOM (toBeInTheDocument, etc.).             |
| **@testing-library/user-event** | 14.6+   | Simulation d’interactions utilisateur.              |
| **jsdom**                       | 28.1+   | Environnement DOM pour les tests front.             |
| **axe-core**                    | 4.11+   | Tests d’accessibilité.                              |
| **Cypress**                     | 15.11+  | Tests E2E.                                          |


**Choix Vitest** : Rapide (Vite sous le capot), compatible ESM natif, API proche de Jest (migration facile). Alternative à Jest : pas de config ESM complexe, plus rapide. Intégration native avec le monorepo (Turbo). Mocking (vi.fn), fake timers, coverage V8.

**Choix Testing Library** : Tests orientés comportement utilisateur, pas d'accès aux détails d'implémentation. Alternative à Enzyme : approche "queries by role", meilleure résilience aux refactors.

**Choix Cypress** : E2E dans un vrai navigateur, time-travel debugging, screenshots/videos. Alternative à Playwright : écosystème plus ancien, nombreux exemples Next.js. Alternative à Selenium : plus simple, moins de flakiness.

**Couverture** : Format LCOV pour SonarQube. Rapports HTML dans `coverage/`. Provider V8 (natif Node) plus rapide qu'Istanbul.

---

## DevOps & Qualité


| Technologie                | Version | Rôle                                         |
| -------------------------- | ------- | -------------------------------------------- |
| **GitHub Actions**         | —       | CI/CD (lint, tests, build, déploiement).     |
| **SonarQube / SonarCloud** | —       | Qualité de code, couverture, vulnérabilités. |
| **Sentry**                 | 8.x+    | Monitoring d'erreurs, tracing et session replay. |
| **Docker**                 | —       | Conteneurisation (infra).                    |
| **ESLint**                 | —       | Linting.                                     |
| **Turbo**                  | 2.8+    | Cache des tâches, parallélisation.           |


**Choix Sentry** : Observabilité full-stack. (1) **Erreurs** : Capture en temps réel des crashs front (JS, hydration) et back (tRPC, Prisma). (2) **Tracing** : Identification des goulots d'étranglement (requêtes SQL lentes, appels API). (3) **Session Replay** : Reproduction vidéo des bugs utilisateurs pour un débuggage ultra-rapide. (4) **Tunneling** : Contournement des bloqueurs de pub via une route Next.js dédiée. Alternative à LogRocket : plus complet pour le backend. Alternative à Datadog : plus accessible pour les petites équipes.

**Choix SonarQube** : Qualité de code (bugs, vulnérabilités, code smells), couverture importée (LCOV), dette technique. Intégration CI, seuils de qualité configurables.

**Choix GitHub Actions** : CI/CD natif GitHub, pas de service externe. Workflows YAML, matrix builds, artefacts. Alternative à GitLab CI : même principe, écosystème GitHub.

**Choix Docker** : Conteneurisation pour déploiement reproductible (front, back). Dockerfiles multi-stage (build + runtime) dans `infra/docker/`. Image Alpine (léger), Node 24, pnpm. Alternative à déploiement bare-metal : environnement identique dev/staging/prod, isolation des dépendances. Compatible Kubernetes, Docker Compose, hébergeurs (Railway, Render, Fly.io). Grafana + Prometheus pour le monitoring (optionnel).

---

## Résumé des choix


| Domaine        | Choix             | Justification                                                      |
| -------------- | ----------------- | ------------------------------------------------------------------ |
| **Langage**    | TypeScript        | Typage fort, DX, partage de types front/back.                      |
| **Framework**  | Next.js 16        | Full-stack, App Router, API Routes, écosystème mature.             |
| **API**        | tRPC              | Type-safety end-to-end, pas de contrat OpenAPI à maintenir.        |
| **ORM**        | Prisma            | Type-safe, migrations, bon support PostgreSQL.                     |
| **Auth**       | Better Auth       | Full-stack type-safe, magic link natif, sessions Prisma, extensible (OAuth, 2FA). Alternative à NextAuth (plus léger) et Clerk (self-hosted). |
| **Styles**     | Tailwind 4        | Rapide, design tokens, pas de CSS-in-JS.                           |
| **UI**         | shadcn/ui (Radix) | Accessible, personnalisable, pas de dépendance à une lib complète. |
| **Données**    | TanStack Query    | Cache, invalidation, états de chargement.                          |
| **Validation** | Zod               | Schémas partagés, inférence de types.                              |
| **Tests**      | Vitest            | Rapide, ESM, proche de Jest.                                       |
| **E2E**        | Cypress           | Stable, bon support Next.js.                                       |
| **Observabilité** | Sentry          | Erreurs, tracing, session replay, tunneling.                       |
| **Conteneurisation** | Docker       | Déploiement reproductible, multi-stage, Alpine.                    |


---

## Versions des runtimes

- **Node.js** : v20 LTS minimum (v22 recommandé pour les perfs).
- **pnpm** : 10.x (workspaces, store global).
- **PostgreSQL** : 14+ (15 ou 16 recommandé).

---

## Liens

- [Architecture](architecture.md)
- [App](app.md)
- [Back](back.md)
- [Référence](reference.md)

