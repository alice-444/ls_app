# LearnSup

Application d’accompagnement pédagogique (tuteurs, apprenants, ateliers). Monorepo TypeScript avec frontend Next.js et backend API.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=alice-444_ls_app)

---

## 📋 Table des matières

- [LearnSup](#learnsup)
  - [📋 Table des matières](#-table-des-matières)
  - [📦 Monorepo](#-monorepo)
  - [🚀 Quick Start](#-quick-start)
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
  - [Workflow de Développement](#workflow-de-développement)
    - [Convention de Commits](#convention-de-commits)
    - [CI/CD](#cicd)
  - [🤝 Contribution](#-contribution)

---

## 📦 Monorepo

Ce projet est géré en monorepo :

- **[app](./app)** – Application Next.js
- **[back](./back)** – API et serveur Next.js

---

## 🚀 Quick Start

### Prérequis

- Node.js v20+
- pnpm v10+
- PostgreSQL v14+

### Installation

```bash
# Cloner et installer
git clone https://github.com/votre-org/ls_app.git
cd ls_app
pnpm install

# Configurer la base de données
createdb learnsup
pnpm db:push

# Démarrer en développement
pnpm dev
```

**URLs :**
- Frontend : [http://localhost:3001](http://localhost:3001)
- Backend (Next.js) : [http://localhost:4500](http://localhost:4500)
- Socket.IO : [http://localhost:5050](http://localhost:5050)

---

## ⚙️ Configuration

Créer les fichiers `.env` à la racine des packages :

**`back/.env`**
```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
CORS_ORIGIN="http://localhost:3001"
CRON_SECRET="your-secret-key-min-32-chars"
```

**`app/.env`**
```env
NEXT_PUBLIC_SERVER_URL="http://localhost:4500"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5050"
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Démarre tous les services (front + back) |
| `pnpm dev:app` | Démarre uniquement le frontend |
| `pnpm dev:back` | Démarre uniquement le backend |
| `pnpm build` | Build toutes les applications |
| `pnpm check-types` | Vérifie les types TypeScript |
| `pnpm db:push` | Synchronise le schéma Prisma (dev) |
| `pnpm db:migrate` | Applique les migrations (prod) |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:studio` | Ouvre Prisma Studio |
| `pnpm test:coverage` | Lance les tests avec couverture de code (Vitest) |

---

## 🛠 Stack Technique

### Core
- **[TypeScript](https://www.typescriptlang.org/)** – Typage statique
- **[Next.js](https://nextjs.org/)** – Framework React full-stack
- **[Prisma](https://www.prisma.io/)** – ORM TypeScript
- **[PostgreSQL](https://www.postgresql.org/)** – Base de données
- **[Turborepo](https://turbo.build/)** – Build et tâches du monorepo

### Frontend
- **[React 19](https://react.dev/)** – UI
- **[Tailwind CSS 4](https://tailwindcss.com/)** – Styles (design tokens)
- **[shadcn/ui](https://ui.shadcn.com/)** – Composants UI (Radix)
- **[TanStack Query](https://tanstack.com/query)** – Données serveur et cache
- **[tRPC](https://trpc.io/)** – API type-safe
- **[Better Auth](https://www.better-auth.com/)** – Authentification (client)
- **[Vitest](https://vitest.dev/)** – Tests unitaires

### Backend
- **[Better Auth](https://www.better-auth.com/)** – Authentification
- **[Zod](https://zod.dev/)** – Validation
- **[Sharp](https://sharp.pixelplumbing.com/)** – Traitement d’images - **[Resend](https://resend.com/)** – Envoi d’emails
- **[Daily.co](https://www.daily.co/)** – Visioconférence
- **[Socket.IO](https://socket.io/)** – Temps réel (messagerie, notifications)
- **[Vitest](https://vitest.dev/)** – Tests unitaires

### DevOps
- **[pnpm](https://pnpm.io/)** – Gestion des paquets (workspaces)
- **[GitHub Actions](https://github.com/features/actions)** – CI/CD
- **[Docker](https://www.docker.com/)** – Conteneurisation (infra)
- **[Cypress](https://www.cypress.io/)** – Tests E2E
- **[Vitest](https://vitest.dev/)** – Tests unitaires + couverture (LCOV pour SonarQube)
- **SonarQube / SonarCloud** – Qualité de code

---

## 📁 Structure

```
ls_app/
├── app/                # Frontend Next.js
├── back/               # Backend (serveur custom + Next.js, Prisma)
├── infra/
│   └── docker/         # Configuration Docker
├── docs/               # Documentation
├── .github/
│   └── workflows/      # Pipelines CI/CD
├── package.json        # Scripts racine et workspaces
├── pnpm-workspace.yaml
├── turbo.json          # Configuration Turborepo
└── sonar-project.properties
```

Documentation complémentaire :
- [docs/README.md](./docs/README.md) — Sommaire de la doc technique
- [docs/tech-stack.md](./docs/tech-stack.md) — Stack technique détaillée et choix technologiques

---

## Workflow de Développement

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
Le projet utilise **GitHub Actions** avec des workflows pour :
- 🔍 **Qualité de code** : Linting et SonarQube
- 🧪 **Tests** : Unitaires, intégration, E2E
- 🚀 **Déploiement** : Build et release

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feat/amazing-feature`)
3. Committer (`git commit -m 'feat: add amazing feature'`)
4. Pousser (`git push origin feat/amazing-feature`)
5. Ouvrir une Pull Request

---

<div align="center">

**[⬆ Retour en haut](#learnsup)**

</div>
