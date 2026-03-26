# LearnSup

Application d’accompagnement pédagogique (tuteurs, apprenants, ateliers). Monorepo TypeScript avec frontend Next.js et backend API.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=alice-444_ls_app)

---

## Table des matières

- [LearnSup](#learnsup)
  - [Table des matières](#table-des-matières)
  - [📦 Monorepo](#-monorepo)
  - [Quick Start](#quick-start)
    - [Prérequis](#prérequis)
    - [Installation](#installation)
  - [⚙️ Configuration](#️-configuration)
  - [📜 Scripts](#-scripts)
  - [🛠 Stack Technique](#-stack-technique)
    - [Core](#core)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [DevOps](#devops)
  - [📁 Structure](#-structure)
  - [Workflow de développement](#workflow-de-développement)
    - [Convention de Commits](#convention-de-commits)
    - [CI/CD](#cicd)
  - [Contribution](#contribution)

---

## 📦 Monorepo

Ce projet est géré en monorepo :

- **[app](./app)** — Application Next.js (UI, API tRPC, routes `/api/*`, Prisma, `server.ts` pour Socket.IO).
- **[shared](./shared)** — Package **`@ls-app/shared`** : types et schémas partagés (build TypeScript → `dist/`).

---

## Quick Start

### Prérequis

- Node.js v20+
- pnpm v10+
- PostgreSQL v14+

### Installation

```bash
git clone https://github.com/alice-444/ls_app.git
cd ls_app
pnpm install

# Configurer la base de données
createdb learnsup
pnpm db:push

pnpm dev
```

**URLs (développement)** :

- Application Next : [http://localhost:3001](http://localhost:3001) (`next dev --port 3001` dans le package `app`)
- Socket.IO : port défini dans `server.ts` — aligner `NEXT_PUBLIC_SOCKET_URL` dans `app/.env`

---

## ⚙️ Configuration

1. **`app/.env`** — Variables utilisées par Next.js et le serveur custom. Le fichier [`app/.env.example`](./app/.env.example) liste les variables **publiques** documentées (`NEXT_PUBLIC_*`, Sentry, Clarity). Les secrets applicatifs ne sont pas tous dupliqués dans cet exemple : les nommer dans votre `.env` local en vous appuyant sur la doc métier et l’infra.
2. **`infra/docker/.env.sample`** — Modèle pour Docker / déploiement (PostgreSQL, CORS, auth, intégrations).
3. **Documentation** — Détails exploitation et intégrations : [`docs/metier-et-ops.md`](./docs/metier-et-ops.md), déploiement : [`docs/deploiement.md`](./docs/deploiement.md).

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Démarre le workspace `app` (Next + serveur Socket via Turborepo) |
| `pnpm dev:app` | Équivalent ciblé : `turbo -F app dev` |
| `pnpm build` | Build monorepo (les tâches `build` des packages, dont `shared` si nécessaire) |
| `pnpm lint` | ESLint via Turborepo |
| `pnpm check-types` | Vérification TypeScript |
| `pnpm test` | Tests (Vitest) |
| `pnpm test:unit` | Alias de `pnpm test` |
| `pnpm db:push` | Synchronise le schéma Prisma (développement) |
| `pnpm db:migrate` | Migrations Prisma (développement) |
| `pnpm db:deploy` | Applique les migrations (CI / prod) |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:studio` | Ouvre Prisma Studio |

---

## 🛠 Stack Technique

### Core

- **[TypeScript](https://www.typescriptlang.org/)** — Typage statique
- **[Next.js 16](https://nextjs.org/)** — Framework React full-stack
- **[Prisma](https://www.prisma.io/)** — ORM
- **[PostgreSQL](https://www.postgresql.org/)** — Base de données
- **[Turborepo](https://turbo.build/)** — Orchestration des tâches du monorepo

### Frontend

- **[React 19](https://react.dev/)** — UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Styles
- **[shadcn/ui](https://ui.shadcn.com/)** — Composants (Radix)
- **[TanStack Query](https://tanstack.com/query)** — Données serveur et cache
- **[tRPC](https://trpc.io/)** — API type-safe
- **[Better Auth](https://www.better-auth.com/)** — Authentification
- **[Vitest](https://vitest.dev/)** — Tests unitaires

### Backend

- **[Better Auth](https://www.better-auth.com/)** — Authentification
- **[Zod](https://zod.dev/)** — Validation
- **[Sharp](https://sharp.pixelplumbing.com/)** — Traitement d’images
- **[Resend](https://resend.com/)** — Envoi d’e-mails
- **[Daily.co](https://www.daily.co/)** — Visioconférence
- **[Socket.IO](https://socket.io/)** — Temps réel (messagerie, notifications)
- **[Vitest](https://vitest.dev/)** — Tests unitaires

### DevOps

- **[pnpm](https://pnpm.io/)** — Paquets et workspaces
- **[GitHub Actions](https://github.com/features/actions)** — CI/CD
- **[Docker](https://www.docker.com/)** — Conteneurisation (`infra/docker`)
- **[Cypress](https://www.cypress.io/)** — Tests E2E
- **SonarCloud** — Qualité de code

---

## 📁 Structure

```
ls_app/
├── app/                 # Next.js (front + API tRPC, Prisma, server.ts)
├── shared/              # @ls-app/shared (types / build tsc)
├── infra/
│   └── docker/          # Docker et exemples d’env
├── docs/                # Documentation technique
├── .github/
│   └── workflows/       # CI/CD
├── package.json         # Scripts racine
├── pnpm-workspace.yaml
├── turbo.json
└── sonar-project.properties
```

Documentation complémentaire :

- [`docs/README.md`](./docs/README.md) — Sommaire de la documentation
- [`docs/tech-stack.md`](./docs/tech-stack.md) — Stack détaillée et choix techniques

---

## Workflow de développement

### Convention de Commits

Suivre [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage du code
- `refactor:` Refactoring
- `test:` Ajout/modification de tests
- `chore:` Tâches de maintenance
- `ci:` CI/CD

### CI/CD

GitHub Actions : lint, tests (unitaires), qualité (dont SonarQube), build et déploiement selon configuration du repo.

---

## Contribution

1. Fork du dépôt
2. Branche de fonctionnalité (`git checkout -b feat/ma-fonctionnalite`)
3. Commits au format conventionnel
4. Push & ouverture d’une Pull Request

---

<div align="center">

[Retour en haut](#learnsup)

</div>
