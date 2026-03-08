# Arborescence LearnSup

Structure du monorepo : vue macro (niveau projet) et vue micro (détail des dossiers et fichiers).

---

## Vue macro

```
ls_app/
├── back/                    # Backend Next.js (API, tRPC, Prisma)
├── front/                   # Frontend Next.js (App Router, React)
├── infra/                   # Infrastructure (Docker, Grafana, Prometheus)
├── cypress/                 # Tests E2E Cypress
├── ai_docs/                 # Documentation IA (PRD, EPTC, PRPs)
├── docs/                    # Documentation technique
├── .github/                 # CI/CD (workflows, linters)
├── package.json             # Racine pnpm workspace
├── pnpm-workspace.yaml
├── turbo.json
├── cypress.config.js
└── README.md
```

| Dossier | Rôle |
|---------|------|
| **back** | API Next.js, tRPC, Better Auth, Prisma, Socket.IO, crons, webhooks |
| **front** | App React Next.js 16, pages, composants, tRPC client, auth |
| **infra** | Dockerfiles (front, back), Grafana, Prometheus |
| **cypress** | Specs E2E, support, fixtures |
| **ai_docs** | PRD, EPTC, PRPs, contexte Gemini |
| **docs** | architecture, back, front, procedure, reference, arborescence |

---

## Vue micro — Racine

```
ls_app/
├── back/
├── front/
├── infra/
│   └── docker/
│       ├── back/
│       ├── front/
│       ├── grafana/
│       └── prometheus/
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
├── ai_docs/
│   ├── PRD/
│   ├── EPTC/
│   ├── PRPs/
│   ├── docs/
│   ├── gemini/
│   └── concept_library/
├── docs/
├── .github/
│   ├── workflows/
│   └── linters/
└── [config: package.json, turbo.json, pnpm-workspace.yaml, ...]
```

---

## Vue micro — Front (`front/`)

```
front/
├── public/                  # Assets statiques
│   ├── typo/omnes/          # Police Omnes
│   ├── logo/
│   └── bg/
├── src/
│   ├── app/                 # App Router (routes = dossiers)
│   ├── components/          # Composants React
│   ├── hooks/               # Hooks personnalisés
│   ├── lib/                 # Clients (auth, API), config
│   ├── shared/             # Validation, constantes partagées
│   ├── types/               # Types TS (trpc-router stub)
│   └── utils/               # Utilitaires (trpc.ts)
├── __tests__/
│   └── units/
└── [next.config, package.json, ...]
```

### `front/src/app/` — Routes (App Router)

```
app/
├── layout.tsx               # Layout racine (Providers, Sidebar, Header)
├── page.tsx                 # / (accueil)
├── error.tsx, not-found.tsx, forbidden.tsx
├── 405/page.tsx
├── login/page.tsx
├── forgot-password/
├── reset-password/
├── verify-email-change/
├── onboarding/
│   ├── page.tsx
│   ├── components/          # RoleSelectionStep, ProfFormStep, ApprenantCompleteStep
│   ├── hooks/useOnboarding.ts
│   ├── schemas.ts, types.ts, constants.ts
├── dashboard/page.tsx
├── profil/page.tsx          # Profil apprenant
├── mentor-profile/page.tsx
├── my-profile/page.tsx
├── my-workshops/page.tsx
├── workshop-editor/page.tsx
├── workshop-room/page.tsx
├── workshops/page.tsx
├── workshop/[id]/
│   ├── page.tsx
│   └── join-video/page.tsx
├── mentors/
│   ├── page.tsx
│   └── [mentorId]/page.tsx
├── apprentice/[userId]/page.tsx
├── inbox/
│   ├── page.tsx
│   └── [conversationId]/page.tsx
├── network/page.tsx
├── community/page.tsx
├── notifications/page.tsx
├── settings/page.tsx
├── buy-credits/page.tsx
├── paliers/page.tsx
├── support-request/page.tsx
├── admin/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── community/
│   ├── audit-logs/
│   ├── feedback-moderation/
│   ├── notifications/
│   ├── onboarding/
│   ├── settings/
│   ├── support/
│   └── user-reports/
├── legal/, terms/, privacy/
├── help/, info/, faq/
└── ...
```

### `front/src/components/` — Composants

```
components/
├── ui/                      # shadcn (button, card, dialog, input, ...)
├── layout/                  # PageContainer, PageHeader, PageCard, SectionSidebar, RoleGate
├── header.tsx, sidebar.tsx, footer.tsx, back-button.tsx
├── sign-in-form.tsx, sign-up-form.tsx
├── user-menu.tsx, notification-bell.tsx
├── theme-provider.tsx
├── loader.tsx
├── apprentice/              # ApprenticeSidebar, UpcomingWorkshopsCard, AvailableWorkshopsGrid, ...
├── dashboard/               # ApprenantDashboard, MentorDashboard, FloatingAddButton
├── mentor/                  # MentorCard, MentorFilters, MentorsGrid, ContactMentorDialog, ...
├── mentor-profile/          # BasicInformationSection, SocialMediaSection, TagListSection, ...
├── profil/                  # ProfilePhotoUpload, ProfilePreviewCard, IceBreakerTagsSection
├── settings/                # PersonalInformationSection, ChangePasswordSection, DeleteAccountSection, ...
├── workshop/                # WorkshopCard, WorkshopDetails, DailyVideoCall, SubmitFeedbackDialog, ...
│   ├── cards/               # WorkshopCard, WorkshopHeader, WorkshopDescription, ...
│   ├── dialogs/              # EditWorkshopRequestDialog, CancelWorkshopRegistrationDialog, ...
│   ├── filters/
│   ├── lists/
│   ├── requests/
│   └── stats/
├── workshop-editor/         # CreateWorkshopForm, EditWorkshopForm, PublishWorkshopDialog
├── messaging/               # ChatWindow, ChatHeader, ConversationList, MessageReactions
├── network/                 # PendingRequestsList, AcceptedConnectionsList
├── community/               # DealsGrid, EventsHubGrid, EventsTabs, MemberDirectory, ProposeDealForm, ProposeEventForm, ProposeSpotForm, SpotFinder, CommunityPoll, ImpactStats
├── faq/
└── user/                   # BlockUserDialog, ReportUserDialog
```

### `front/src/lib/`, `hooks/`, `shared/`

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

shared/
└── validation/             # Zod, file, workshop, password, date
```

---

## Vue micro — Back (`back/`)

```
back/
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
│   ├── api/
│   ├── trpc/
│   └── units/
└── [next.config, package.json, ...]
```

### `back/src/app/` — Routes API

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

### `back/src/routers/` — tRPC

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

### `back/src/lib/` — Services et infrastructure

```
lib/
├── auth.ts                 # Better Auth config
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

| Besoin | Emplacement |
|--------|-------------|
| Page d'accueil | `front/src/app/page.tsx` |
| Layout global | `front/src/app/layout.tsx` |
| Sidebar | `front/src/components/sidebar.tsx` |
| Client tRPC | `front/src/utils/trpc.ts` |
| Auth client | `front/src/lib/auth-client.ts` |
| Point d'entrée back | `back/server.ts` |
| AppRouter tRPC | `back/src/routers/index.ts` |
| Schéma Prisma | `back/prisma/schema/schema.prisma` |
| Better Auth | `back/src/lib/auth.ts` |
| Routes API | `back/src/app/api/` |

---

## Liens

- [Architecture](architecture.md)
- [Front](front.md)
- [Back](back.md)
- [Référence](reference.md)
