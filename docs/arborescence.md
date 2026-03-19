# Arborescence LearnSup

Structure du monorepo : vue macro (niveau projet) et vue micro (détail des dossiers et fichiers).

---

## Sommaire

- [Arborescence LearnSup](#arborescence-learnsup)
  - [Sommaire](#sommaire)
  - [Légende](#légende)
  - [Vue macro](#vue-macro)
  - [Schéma des dépendances](#schéma-des-dépendances)
  - [Schéma système et flux](#schéma-système-et-flux)
    - [Flux de routage HTTP (entrée requête)](#flux-de-routage-http-entrée-requête)
  - [Vue micro — Racine](#vue-micro--racine)
    - [`infra/` — Structure détaillée](#infra--structure-détaillée)
  - [Vue micro — Shared](#vue-micro--shared)
  - [Vue micro — App](#vue-micro--app)
    - [Schéma : hiérarchie des composants front](#schéma--hiérarchie-des-composants-front)
    - [`app/src/lib/`, `hooks/`](#appsrclib-hooks)
  - [Vue micro — Package app (API)](#vue-micro--package-app-api)
    - [Schéma : flux Router → Service → Repository](#schéma--flux-router--service--repository)
    - [`app/src/app/` — Routes API](#appsrcapp--routes-api)
    - [`app/src/routers/` — tRPC](#appsrcrouters--trpc)
    - [`app/src/lib/` — Services et infrastructure](#appsrclib--services-et-infrastructure)
  - [Index rapide](#index-rapide)
    - [Par besoin](#par-besoin)
    - [Cas d'usage](#cas-dusage)
  - [Conventions de nommage](#conventions-de-nommage)
  - [Liens](#liens)

---

## Légende

| Symbole | Signification |
|---------|---------------|
| `[...]` | Contenu résumé ou non détaillé |
| `[dossier]/` | Dossier avec sous-éléments |
| `# commentaire` | Commentaire explicatif |

---

## Vue macro

```
ls_app/
├── app/                     # Application Next.js (Front + Back tRPC/API)
├── shared/                  # Package partagé (validation Zod, types, constantes)
├── infra/                   # Infrastructure (Docker, Grafana, Prometheus)
├── docs/                    # Documentation technique
├── .github/                 # CI/CD (workflows, linters)
├── package.json             # Racine pnpm workspace
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```
---

## Schéma des dépendances

```mermaid
flowchart TB
  subgraph Workspace["pnpm workspace"]
    shared["shared"]
    app["app"]
  end

  app --> shared

  shared -.->|"Zod, types, constantes"| app
```

---

## Schéma système et flux

### Flux de routage HTTP (entrée requête)

```mermaid
flowchart TB
  Client["Client HTTP"]
  Server["server.ts"]
  CORS["CORS"]
  Next["Next.js"]
  Route{"Route ?"}

  TRPC["/trpc → routers/"]
  Auth["/api/auth/*"]
  Profile["/api/profile/*"]
  Cron["/api/cron/*"]
  Webhooks["/api/daily, polar"]
  Metrics["/api/metrics"]

  Client --> Server
  Server --> CORS
  CORS --> Next
  Next --> Route
  Route -->|tRPC| TRPC
  Route -->|Auth| Auth
  Route -->|Profil| Profile
  Route -->|Cron| Cron
  Route -->|Webhooks| Webhooks
  Route -->|Métriques| Metrics

  TRPC --> Lib["lib/ (services)"]
  Auth --> Lib
  Profile --> Lib
  Lib --> Prisma[(Prisma)]
  Prisma --> DB[(PostgreSQL)]
```

---

## Vue micro — Racine

```
ls_app/
├── app/
├── shared/
│   ├── src/
│   │   ├── validation/      # Schémas Zod
│   │   ├── types/           # Types TS partagés
│   │   └── utils/           # Utilitaires (date, etc.)
│   └── dist/
├── infra/
│   └── docker/
│       ├── back/
│       ├── app/
│       ├── grafana/
│       └── prometheus/
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
├── docs/
├── .github/
│   ├── workflows/
│   └── linters/
└── [config: package.json, turbo.json, pnpm-workspace.yaml, ...]
```

### `infra/` — Structure détaillée

```
infra/
└── docker/
    ├── back/
    │   ├── Dockerfile.dev
    │   └── Dockerfile.prod
    ├── app/
    │   ├── Dockerfile.dev
    │   └── Dockerfile.prod
    ├── grafana/
    │   └── provisioning/
    │       ├── dashboards/
    │       └── datasources/
    ├── prometheus/
    │   └── prometheus.yml
    ├── Docker-compose-dev.yml
    └── docker-compose-prod.yml
```

---

## Vue micro — Shared

Package workspace `@ls-app/shared` : source de vérité pour la validation, les types et les constantes partagés entre front et back. **À ne pas confondre** avec `app/src/shared/` (qui n'existe pas) : l'app importe via `@ls-app/shared`.

```
shared/
├── src/
│   ├── validation/          # Schémas Zod (auth, workshop, profile, file, password, etc.)
│   │   ├── auth.schemas.ts
│   │   ├── workshop.schemas.ts
│   │   ├── workshop.constants.ts
│   │   ├── profile.schemas.ts
│   │   ├── profile.constants.ts
│   │   ├── user.schemas.ts
│   │   ├── file.validators.ts
│   │   ├── password.validators.ts
│   │   ├── date.validators.ts
│   │   ├── support.schemas.ts
│   │   ├── community.schemas.ts
│   │   ├── admin.schemas.ts
│   │   ├── notification.schemas.ts
│   │   └── common.schemas.ts
│   ├── types/               # Types TS partagés
│   │   ├── user.ts
│   │   ├── workshop.ts
│   │   └── messaging.ts
│   ├── utils/
│   │   └── date.ts
│   └── index.ts             # Exports publics
├── dist/                    # Build output
├── package.json
└── tsconfig.json
```

---

## Vue micro — App

```
app/
├── public/                  # Assets statiques
│   ├── typo/omnes/          # Police Omnes
│   ├── logo/
│   └── bg/
├── src/
│   ├── app/                 # App Router (routes = dossiers)
│   ├── components/          # Composants React
│   ├── hooks/               # Hooks personnalisés
│   ├── lib/                 # Clients (auth, API), config
│   ├── types/               # Types TS (trpc-router stub, workshop-components)
│   └── utils/               # Utilitaires (trpc.ts)
├── __tests__/
│   └── units/
└── [next.config, package.json, ...]
```

### Schéma : hiérarchie des composants front

```mermaid
flowchart TB
  Layout["layout.tsx"]
  Sidebar["sidebar.tsx"]
  RoleGate["RoleGate"]

  subgraph Pages["Pages (app/)"]
    Dashboard["dashboard"]
    Profil["profil"]
    Workshops["workshops"]
  end

  subgraph Domain["Composants métier"]
    Apprentice["apprentice/"]
    Mentor["mentor/"]
    Workshop["workshop/"]
    Messaging["messaging/"]
  end

  subgraph UI["Composants UI (shadcn)"]
    Button["button"]
    Card["card"]
    Dialog["dialog"]
  end

  Layout --> Sidebar
  Layout --> RoleGate
  Layout --> Pages
  Pages --> Domain
  Domain --> UI
```

### `app/src/lib/`, `hooks/`

> **Note** : Le front n'a pas de dossier `shared/` local. Les schémas Zod, types et constantes sont importés depuis le package `@ls-app/shared` (voir [Vue micro — Shared](#vue-micro--shared)).

```
lib/
├── auth-client.ts           # Better Auth + customAuthClient (signUp, selectRole, uploadPhoto, ...)
├── api-client.ts            # authenticatedFetch, getMentorProfile, getUserRole
└── messaging/               # (si présent)

hooks/
├── useDashboard.ts
├── useMentorProfile.ts
├── useMyWorkshops.ts
├── useChatSocket.ts
├── useOnboarding.ts
├── use-password-form.ts
└── use-photo-upload.ts
```

---

## Vue micro — Package app (API)

Tout le code serveur et les routes Next côté « back » se trouvent dans **`app/`** (un seul package ; pas de dossier `back/` au niveau repo sauf éventuellement sous `infra/docker/` pour Docker).

```
app/
├── server.ts                # Point d'entrée HTTP (CORS, Socket.IO, Next)
├── prisma/
│   ├── schema/
│   │   └── schema.prisma
│   ├── generated/client/
│   └── migrations/
├── src/
│   ├── app/                 # Routes Next (API, trpc)
│   ├── routers/             # tRPC appRouter
│   └── lib/                 # Services, repositories, DI
├── __tests__/
│   └── units/                # Tests Vitest (services, hooks, validation, …)
└── [next.config, package.json, start.sh, ...]
```

### Schéma : flux Router → Service → Repository

```mermaid
flowchart LR
  subgraph Routers["routers/"]
    R1["workshop.router"]
    R2["mentor.router"]
    R3["apprentice.router"]
  end

  Container["di/container"]
  S1["WorkshopLifecycleService"]
  S2["WorkshopRequestService"]
  Repo["Prisma / Repositories"]
  DB[(PostgreSQL)]

  R1 --> Container
  R2 --> Container
  R3 --> Container
  Container --> S1
  Container --> S2
  S1 --> Repo
  S2 --> Repo
  Repo --> DB
```

### `app/src/app/` — Routes API

```
app/
├── api/
│   ├── auth/
│   │   ├── [...all]/route.ts        # Better Auth
│   │   └── magic-link-callback/route.ts
│   ├── sign-up/route.ts
│   ├── sign-in/route.ts
│   ├── onboarding/select-role/route.ts
│   ├── profile/
│   │   ├── role/route.ts
│   │   ├── role/mentor/route.ts
│   │   ├── upload-photo/route.ts
│   │   ├── photo/[filename]/route.ts
│   │   ├── publish/route.ts
│   │   └── delete/route.ts
│   ├── support-request/
│   │   ├── route.ts
│   │   └── attachments/[filename]/route.ts
│   ├── cron/
│   │   ├── all/route.ts
│   │   ├── generate-video-links/
│   │   ├── cleanup-inactive-rooms/
│   │   ├── process-cashback-queue/
│   │   ├── retry-failed-cashbacks/
│   │   ├── create-feedback-notifications/
│   │   ├── purge-deletions/
│   │   └── check-cashback-integrity/
│   ├── daily/webhook/route.ts
│   ├── polar/webhook/route.ts
│   └── metrics/route.ts
└── trpc/[trpc]/route.ts
```

### `app/src/routers/` — tRPC

```
routers/
├── index.ts                 # appRouter (agrégation)
├── shared/router-helpers.ts
├── auth/auth.router.ts
├── credits/credits.router.ts
├── mentors/mentor.router.ts
├── workshops/
│   ├── workshop.router.ts
│   ├── workshop-attendance.router.ts
│   ├── workshop-video.router.ts
│   ├── workshop-feedback.router.ts
│   └── analytics/cashback-analytics.router.ts
├── social/
│   ├── community.router.ts
│   ├── messaging.router.ts
│   ├── messaging-conversation.router.ts
│   ├── messaging-message.router.ts
│   ├── messaging-presence.router.ts
│   ├── messaging-reaction.router.ts
│   ├── connection.router.ts
│   └── notification.router.ts
├── users/
│   ├── user.router.ts
│   ├── apprentice.router.ts
│   ├── account-settings.router.ts
│   └── moderation/
│       ├── user-block.router.ts
│       └── user-report.router.ts
├── admin/admin.router.ts
└── support/support.router.ts
```

### `app/src/lib/` — Services et infrastructure

```
lib/
├── auth-server.ts          # Better Auth (serveur)
├── prisma.ts, context.ts, trpc.ts
├── api-helpers/            # getAuthenticatedSession, parseJsonBody, handleRouteError, cron-auth
├── di/container.ts         # DI, ServicesContainer
├── common/                 # prisma, logger, Result, audit-log
├── auth/services/          # signup, signin, onboarding, magic-link
├── users/
│   ├── repositories/       # AppUser, Account, Session, Connection, Moderation
│   └── services/
│       ├── account/        # deletion, profile, security (forgot-password, change-password, change-email)
│       ├── connection/
│       ├── profile/
│       └── moderation/
├── mentors/
│   ├── repositories/       # Mentor, WorkshopRequest
│   └── services/
│       ├── contact/        # MentorContactService
│       ├── feedback/
│       ├── profile/
│       └── workshops/     # WorkshopRequestService, WorkshopForRequestFactory, ...
├── workshops/
│   ├── repositories/       # Workshop, Feedback, Cashback
│   ├── utils/              # workshop-helpers (dont calculateDailyRoomAccessWindow), workshop-public-dto.mapper
│   └── services/
│       ├── lifecycle/      # WorkshopLifecycleService (create, publish, cancel, ...)
│       ├── query/         # WorkshopQueryService
│       ├── scheduling/     # WorkshopSchedulingService
│       ├── attendance/     # présence, check-in
│       ├── feedback/       # WorkshopFeedbackService, FeedbackModerationService
│       ├── rewards/        # CashbackCalculator, CashbackQueueProcessor
│       ├── guards/         # WorkshopAccessGuard
│       ├── video/         # WorkshopVideoLinkService
│       └── email/
├── messaging/
│   ├── repositories/       # Conversation, Message, MessageReaction
│   └── services/
│       ├── core/          # MessagingService, MessageOperationsService, ConversationService
│       ├── enrichment/
│       ├── reactions/
│       └── validation/
├── notifications/
│   ├── repositories/
│   └── services/           # SocketNotificationEventEmitter
├── credits/
│   ├── repositories/       # CreditTransaction
│   └── services/          # CreditService
├── payment/services/       # PolarService
├── daily/services/         # DailyService
├── email/
│   ├── services/
│   ├── templates/          # WelcomeEmail, SupportRequestConfirmation, CreditPurchaseConfirmation, ...
│   └── utils/
├── socket/
│   └── handlers/          # SocketMessageHandler
├── admin/services/         # AdminService
├── support/               # SupportRequest
├── maintenance/services/   # MaintenanceService (crons: generateVideoLinks, cleanupRooms, purgeDeletions, ...)
├── rate-limit/
├── metrics/
└── shared/validation/      # Zod, workshop schemas, password
```

---

## Index rapide

### Par besoin

| Besoin | Emplacement |
|--------|-------------|
| Page d'accueil | `app/src/app/page.tsx` |
| Layout global | `app/src/app/layout.tsx` |
| Sidebar | `app/src/components/sidebar.tsx` |
| Client tRPC | `app/src/utils/trpc.ts` |
| Auth client | `app/src/lib/auth-client.ts` |
| Point d'entrée serveur | `app/server.ts` |
| AppRouter tRPC | `app/src/routers/index.ts` |
| Schéma Prisma | `app/prisma/schema/schema.prisma` |
| Better Auth | `app/src/lib/auth-server.ts` |
| Routes API | `app/src/app/api/` |

### Cas d'usage

| Question | Emplacement |
|----------|-------------|
| Où modifier les schémas Zod partagés ? | `shared/src/validation/` |
| Où sont les types partagés ? | `shared/src/types/` |
| Où ajouter une route API ? | `app/src/app/api/` |
| Où ajouter une procédure tRPC ? | `app/src/routers/` |
| Où ajouter une page front ? | `app/src/app/[route]/page.tsx` |
| Où sont les composants UI réutilisables ? | `app/src/components/ui/` |
| Où configurer l'auth ? | `app/src/lib/auth-server.ts` |

---

## Conventions de nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Route App Router | `page.tsx` dans un dossier | `app/dashboard/page.tsx` |
| Router tRPC | `*.router.ts` | `mentor.router.ts`, `workshop.router.ts` |
| Service backend | `*.service.ts` | `WorkshopLifecycleService` |
| Repository | `*.repository.ts` ou dans `repositories/` | `WorkshopRepository` |
| Composant React | PascalCase | `MentorCard.tsx` |
| Hook | `use*.ts` | `useDashboard.ts` |
| Test unitaire | `*.test.ts` ou `*.test.tsx` | `apprentice.getDashboardData.test.ts` |
| Test E2E Cypress | `*.cy.{ts,tsx}` | `login.cy.ts` |

---

## Liens

- [Architecture](architecture.md) — schémas système détaillés, flux auth, atelier, messagerie, etc.
- [App](app.md)
- [Back](back.md)
- [Référence](reference.md)
