# LearnSup

...

## Features

### Stack Technique

- **TypeScript** - Type safety et meilleure expérience développeur
- **Next.js** - Framework React full-stack
- **TailwindCSS** - CSS utility-first pour le développement rapide
- **shadcn/ui** - Composants UI réutilisables
- **Prisma** - ORM TypeScript-first
- **PostgreSQL** - Base de données
- **Better Auth** - Authentification email & password
- **tRPC** - API type-safe
- **Zod** - Validation de schémas
- **Docker** -

### Fonctionnalités



## Getting Started

### Prérequis

- Node.js (v18+)
- pnpm (v10+)
- PostgreSQL

### Installation

```bash
# Installer les dépendances
pnpm install
```
## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Generate the Prisma client and push the schema:
```bash
pnpm db:push
```


Then, run the development server:

```bash
# Démarrer tous les services (web + server)
pnpm dev
```

- **Frontend** : [http://localhost:3001](http://localhost:3001)
- **Backend API** : [http://localhost:3000](http://localhost:3000)

## Project Structure

```
learnsup/
├── apps/
│   ├── web/                    # Frontend
│   │   ├── src/
│   │   │   ├── app/            
│   │   │   │   ├── onboarding/ # Page d'onboarding
│   │   │   │   ├── dashboard/  # Tableau de bord
│   │   │   │   └── login/      # Page de connexion
│   │   │   ├── components/     # Composants
│   │   │   └── lib/            # Utilitaires frontend
│   │   └── package.json
│   │
│   └── server/                 # Backend API
│       ├── src/
│       │   ├── app/
│       │   │   └── api/        
│       │   │       ├── auth/   # Routes Better Auth
│       │   │       ├── onboarding/ # Routes onboarding
│       │   │       └── sign-up/    # Route inscription
│       │   └── lib/
│       │       ├── auth/       # Services d'authentification
│       │       │   └── services/
│       │       │       ├── signup.ts
│       │       │       ├── signin.ts
│       │       │       └── onboarding.ts
│       │       ├── common/     
│       │       │   ├── types.ts      # Types partagés
│       │       │   ├── validation.ts # Validation centralisée
│       │       │   └── prisma.ts     # Instance Prisma centralisée
│       │       ├── users/
│       │       │   └── repositories/ 
│       │       │       └── app-user.repository.ts
│       │       └── utils/
│       │           └── id-generator.ts
│       └── package.json
│
├── package.json                
├── pnpm-workspace.yaml         
└── turbo.json                  
```

## Available Scripts

### Développement

- `pnpm dev` - Démarrer tous les services en mode développement
- `pnpm dev:web` - Démarrer uniquement le frontend
- `pnpm dev:server` - Démarrer uniquement le backend

### Build

- `pnpm build` - Build toutes les applications
- `pnpm check-types` - Vérifier les types TypeScript

### Base de données

- `pnpm db:push` - Pousser les changements de schéma vers la DB (dev)
- `pnpm db:migrate` - Créer/appliquer les migrations
- `pnpm db:generate` - Générer le client Prisma
- `pnpm db:studio` - Ouvrir Prisma Studio (interface graphique DB)
