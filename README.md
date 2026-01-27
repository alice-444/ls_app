# LearnSup

...

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

- **[apps/web](./apps/web)** - Application Next.js (Frontend)
- **[apps/server](./apps/server)** - API Next.js (Backend)

---

## 🚀 Quick Start

### Prérequis

- Node.js v20+
- pnpm v10+
- PostgreSQL v14+

### Installation

```bash
# Cloner et installer
git clone https://github.com/votre-org/learnsup.git
cd learnsup
pnpm install

# Configurer la base de données
createdb learnsup
pnpm db:push

# Démarrer en développement
pnpm dev
```

**URLs :**
- Frontend : [http://localhost:3001](http://localhost:3001)
- Backend : [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuration

Créez les fichiers `.env` :

**`apps/server/.env`**
```env
DATABASE_URL="prisma+postgresql://..."
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
CORS_ORIGIN="http://localhost:3001"
CRON_SECRET="your-secret-key-min-32-chars"
```

**`apps/web/.env`**
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Démarre tous les services (web + server) |
| `pnpm dev:web` | Démarre uniquement le frontend |
| `pnpm dev:server` | Démarre uniquement le backend |
| `pnpm build` | Build toutes les applications |
| `pnpm check-types` | Vérifie les types TypeScript |
| `pnpm db:push` | Synchronise le schéma Prisma (dev) |
| `pnpm db:migrate` | Applique les migrations (prod) |
| `pnpm db:generate` | Génère le client Prisma |
| `pnpm db:studio` | Ouvre Prisma Studio |

---

## 🛠 Stack Technique

### Core
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Next.js 16](https://nextjs.org/)** - Framework React full-stack
- **[Prisma](https://www.prisma.io/)** - ORM TypeScript-first
- **[PostgreSQL](https://www.postgresql.org/)** - Base de données
- **[Turborepo](https://turbo.build/)** - Monorepo build system

### Frontend
- **[TailwindCSS](https://tailwindcss.com/)** - Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI
- **[TanStack Query](https://tanstack.com/query)** - State management
- **[tRPC](https://trpc.io/)** - API type-safe

### Backend
- **[Better Auth](https://www.better-auth.com/)** - Authentification
- **[Zod](https://zod.dev/)** - Validation
- **[Sharp](https://sharp.pixelplumbing.com/)** - Traitement d'images

### DevOps
- **[pnpm](https://pnpm.io/)** - Package manager
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD
- **SonarQube** - Scanner
- **[Docker](https://www.docker.com/)** - Conteneurisation
- **[Cypress](https://www.cypress.io/)** - Tests E2E

---

## 📁 Structure

```
learnsup/
├── apps/
│   ├── web/           # Frontend Next.js
│   └── server/        # Backend API
├── infra/
│   └── docker/        # Configuration Docker
├── .github/
│   └── workflows/     # CI/CD pipelines
├── package.json       # Scripts racine
├── pnpm-workspace.yaml
└── turbo.json         # Configuration Turborepo
```

Pour plus de détails, consultez les README de chaque application :
- [Documentation Frontend](./apps/web/README.md)
- [Documentation Backend](./apps/server/README.md)

---



## Workflow de Développement

### Convention de Commits
Suivez [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage du code
- `refactor:` Refactoring
- `test:` Ajout/modification de tests
- `chore:` Tâches de maintenance
- `ci:` CI/CD

### CI/CD
Le projet utilise **GitHub Actions** avec 3 workflows :
- 🔍 **Code Quality** : Linting + SonarQube
- 🧪 **Tests** : Unit, Integration, E2E
- 🚀 **Deployment** : Build et release automatique

---

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feat/amazing-feature`)
3. Committez (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feat/amazing-feature`)
5. Ouvrez une Pull Request

---


<div align="center">

**[⬆ Retour en haut](#-learnsup)**

</div>
