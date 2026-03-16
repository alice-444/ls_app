# Front — Application LearnSup

Application Next.js (client) : pages, UI, appels API via tRPC, authentification Better Auth et routes custom (onboarding, profil).

---

## Schéma de l’application

```mermaid
flowchart TB
  subgraph Root["layout.tsx"]
    direction TB
    P[Providers]
    S[Sidebar]
    H[Header]
    M[main]
    F[Footer]
    B[ScrollToTopButton]
  end

  subgraph P["Providers"]
    Theme[ThemeProvider]
    TRPC[TRPCProvider]
    Query[QueryClientProvider]
    Toaster[Toaster]
  end

  subgraph SD[Sources de données]
    tRPC[tRPC hooks]
    Auth[authClient.useSession]
    API[api-client / customAuthClient]
  end

  Root --> P
  M --> SD
  tRPC --> Back["Back /trpc"]
  Auth --> Back
  API --> Back
```

Flux typique (échanges) :

```mermaid
sequenceDiagram
  participant Page as Page (app/*)
  participant Hook as trpc.*.useQuery / useMutation
  participant Client as tRPC client (utils/trpc)
  participant Back as Back /trpc
  participant Session as Cookie session

  Page->>Hook: Appel
  Hook->>Client: Requête (credentials: include)
  Client->>Back: POST /trpc (batch)
  Back->>Session: Vérification session
  Back-->>Client: JSON
  Client-->>Hook: Données typées
  Hook-->>Page: Affichage
```

---

## 🔄 Cycle de vie des données (Cache & Mutations)

L'application utilise **TanStack Query** piloté par **tRPC** pour synchroniser l'état du serveur avec l'interface utilisateur.

```mermaid
flowchart TD
    UI[Page / Composant] --> Query[trpc.useQuery]
    Query --> Cache{Cache présent ?}
    Cache -->|Oui & Fresh| Render[Affichage immédiat]
    Cache -->|Non ou Stale| API[Appel tRPC Client]
    API --> Back[Serveur /trpc]
    Back -->|Données JSON| API
    API --> UpdateCache[Mise à jour Cache]
    UpdateCache --> Render

    subgraph Modification["Modification (Mutation)"]
        Submit[trpc.useMutation]
        Submit -->|onSuccess| Invalidation[invalidateQueries]
        Invalidation -->|Trigger| Query
    end

    %% Styles
    style Query fill:#dfd,stroke:#333
    style Mutation fill:#fdd,stroke:#333
    style Cache stroke-width:4px
```

---

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **tRPC** (client) + **TanStack Query** — appels API type-safe, cache, toasts d’erreur sur échec
- **Better Auth** — client d’authentification (session, login) ; basePath `/api/auth`
- **Tailwind CSS 4** — styles (variables CSS `--primary-orange`, `--primary-purple`, etc.)
- **shadcn/ui** (Radix) — boutons, cartes, dialogs, dropdowns, inputs, etc.
- **Lucide React** — icônes
- **Zod** — validation (formulaires, schémas partagés avec le back dans `shared/`)
- **Daily.co** (daily-js) — visio pour les ateliers (rejoindre une salle)
- **Socket.io client** — temps réel (notifications, messagerie)
- **React Hook Form** + **TanStack Form** — formulaires
- **next-themes** — thème clair/sombre (classe `dark` sur la racine)
- **Sonner** — toasts
- **Police** : Omnes (chargée dans `index.css`)

Le client tRPC pointe vers `NEXT_PUBLIC_SERVER_URL/trpc` avec `credentials: "include"`. Le type du router est importé depuis un stub local `@/types/trpc-router` (pas d’import direct depuis le back pour le build).

---

## Structure des dossiers

- **`src/app/`** — Routes (App Router). Chaque route = un dossier avec `page.tsx` ; `layout.tsx` à la racine enveloppe toute l’app (Providers, Sidebar, Header, Footer, ScrollToTopButton). Onboarding : `onboarding/` avec composants (RoleSelectionStep, ProfFormStep, ApprenantCompleteStep), hooks (`useOnboarding`), schémas. Pages d’erreur : `not-found.tsx` (404), `error.tsx` (500), `forbidden.tsx` (403), `405/page.tsx` (405).
- **`src/components/`** — Composants organisés par domaine :
  - `ui/` — Design system shadcn (boutons, cartes, dialogs, inputs, avatar, tabs, etc.).
  - `layout/` — PageContainer, PageHeader, PageCard, SectionSidebar.
  - `header.tsx`, `sidebar.tsx`, `footer.tsx`, `back-button.tsx` — Shell de l'app.
  - `apprentice/` — Dashboard et ateliers apprenant (ApprenticeSidebar, UpcomingWorkshopsCard, AvailableWorkshopsGrid, ApprenticeWorkshopDashboard).
  - `dashboard/` — Dashboards (ApprenantDashboard, ApprenantDashboardSidebar, MentorDashboard, FloatingAddButton).
  - `messaging/` — Messagerie (ChatWindow, ChatHeader, ConversationList, ConversationRow, NewConversationDialog, ReplyPreview, MessageReactions).
  - `mentor/` — Dialogues et feedbacks mentor (ContactMentorDialog, RequestWorkshopDialog, RequestWorkshopParticipationDialog, MentorFeedbacks, MentorWorkshopsList).
  - `mentor-profile/` — Formulaire profil mentor (BasicInformationSection, SocialMediaSection, TagListSection, PublicationSection, schema/constantes).
  - `profil/` — Formulaire profil apprenant (ProfilePhotoUpload, ProfilePreviewCard, IceBreakerTagsSection).
  - `settings/` — Sections paramètres (PersonalInformationSection, ChangePasswordSection, ChangeEmailSection, BlockedUsersSection, DeleteAccountSection, NotificationsSection, SystemSettingsSection, etc.).
  - `my-workshops/` — Gestion ateliers mentor (CalendarSection, NextWorkshopBanner, WorkshopFiltersBar).
  - `workshop/`, `workshop-editor/` — Détail et éditeur d'atelier.
  - `user/` — Composants transversaux (BlockUserDialog, ReportUserDialog).
  - `community/` — Hub communauté : DealsGrid, EventsHubGrid, EventsTabs, MemberDirectory, ProposeDealForm, ProposeEventForm, ProposeSpotForm, SpotFinder, CommunityPoll, ImpactStats.
  - `network/`, `faq/` — Réseau et FAQ.
- **`src/lib/`** — Clients et config : `auth-client.ts` (Better Auth + customAuthClient pour sign-up, onboarding, profil mentor, upload photo, suppression de compte), `api-client.ts` (API_BASE_URL, authenticatedFetch, getMentorProfile, getUserRole), `utils.ts` (cn, etc.).
- **`src/utils/trpc.ts`** — Création du client tRPC et du QueryClient (gestion des erreurs auth, toasts).
- **`src/components/providers.tsx`** — ThemeProvider, TRPCProvider, QueryClientProvider, Toaster.
- **`src/shared/`** — Validation et constantes partagées avec le back (Zod, password, workshop, file, date).
- **`src/hooks/`** — Hooks React : `useDashboard` (données dashboard apprenant/mentor, rôles, ateliers), `useMentorProfile` (formulaire profil mentor), `useMyWorkshops` (gestion ateliers mentor), `useChatSocket` (socket.io messagerie), `useOnboarding` (onboarding), `use-password-form`, `use-photo-upload`.
- **`src/types/`** — Types TS (workshop, trpc-router stub).

---

## Routes (pages) principales

- **Publiques** : `/` (accueil), `/login` (email/mot de passe ou magic link), `/forgot-password`, `/reset-password`, `/verify-email-change`, `/legal`, `/terms`, `/privacy`, `/help`, `/info`.
- **Auth / onboarding** : `/onboarding` (choix de rôle, formulaire mentor ou apprenant).
- **Espace utilisateur** : `/dashboard`, `/my-profile`, `/profil`, `/mentor-profile`, `/settings` (profil, mot de passe, email, blocages, suppression de compte).
- **Ateliers** : `/workshops`, `/workshop/[id]`, `/workshop/[id]/join-video`, `/workshop-editor`, `/my-workshops`, `/catalog`, `/paliers`, `/buy-credits`.
- **Mentors / catalogue** : `/mentors`, `/mentors/[mentorId]` (profil public avec connexion réseau, demande d’atelier, feedbacks, liste d’ateliers), `/apprentice/[userId]`.
- **Communauté** : `/community` (Hub : Events Hub, ateliers mentorat, bons plans, Spot Finder, sondage, annuaire membres).
- **Réseau & messagerie** : `/network`, `/inbox`, `/inbox/[conversationId]`.
- **Notifications** : `/notifications`.
- **Support** : `/support-request`.
- **Admin** : `/admin` (dashboard), `/admin/users` (gestion avec bulk actions), `/admin/users/[id]` (Fiche 360°), `/admin/community` (modération propositions et création directe), `/admin/feedback-moderation`, `/admin/audit-logs`, `/admin/user-reports`, `/admin/support` (threadé), `/admin/onboarding`, `/admin/notifications`, `/admin/notifications/bulk` (moteur de segmentation), `/admin/settings`.
- **Erreurs** : 404 (not-found), 500 (error), 403 (forbidden), 405 (`/405`).

Navigation connectée (sidebar) selon le rôle — entrées de menu :

```mermaid
flowchart LR
  subgraph Commun["Tous les rôles"]
    A[Dashboard]
    B[Communauté]
  end

  subgraph Mentor["Si MENTOR"]
    E[Atelab]
    F[Mes ateliers]
    G[Mon profil mentor]
  end

  subgraph Apprenant["Si APPRENANT"]
    H[Catalogue]
    I[Profil]
  end

  subgraph Admin["Si ADMIN (Espace /admin)"]
    L[Dashboard Admin]
    M[Signalements / Rapports]
    N[Utilisateurs / Onboarding]
    O[Modération / Audit]
    P[Support / Notifications]
  end

  subgraph Bas["En bas"]
    J[Aide et support]
    K[Informations]
  end

  Sidebar[Sidebar] --> Commun
  Sidebar --> Mentor
  Sidebar --> Apprenant
  Sidebar --> Admin
  Sidebar --> Bas
```

- **ADMIN** : la sidebar principale (utilisateur) est masquée ; les admins accèdent à l’interface admin via `/admin` qui possède sa propre configuration de sidebar (`ADMIN_NAV_ITEMS`). Elle regroupe : Dashboard, Signalements, Modération, Utilisateurs, Support, Communauté.
- **Catalogue** (APPRENANT) : sous-navigation Live (`/catalog/live`), Replay (`/catalog/replay`), Prochains ateliers (`/catalog/upcoming`). Ces sous-routes peuvent rediriger vers la page principale selon l’implémentation.

Voir `src/components/sidebar.tsx` et `src/app/admin/layout.tsx`.

---

## Authentification et profil

```mermaid
flowchart TB
  subgraph Session["Session"]
    useSession[authClient.useSession]
    useSession --> Sidebar[Sidebar visible]
    useSession --> getRole[getUserRole]
    getRole --> Nav[Nav selon MENTOR / APPRENANT]
  end

  subgraph Inscription["Inscription / onboarding"]
    signUp[signUpEmail]
    selectRole[selectRole]
    signUp --> selectRole
    selectRole --> FormMentor[Formulaire mentor]
    selectRole --> FormApp[Formulaire apprenant]
    FormMentor --> saveMentor[saveMentorProfile]
    saveMentor --> publish[publishProfile / unpublishProfile]
  end

  subgraph Profil["Profil"]
    upload[uploadPhoto\nPOST multipart]
    delete[deleteAccount]
  end

  Session --> Back["Back\n/api/auth, /api/profile/role"]
  Inscription --> Back
  Profil --> Back
```

- **Session** : `authClient.useSession()` (Better Auth). Si pas de session (ou sur `/login`), la sidebar ne s’affiche pas.
- **Magic link** : `trpc.auth.requestMagicLink.useMutation` envoie un lien par email ; l’utilisateur clique et est redirigé vers `/api/auth/magic-link-callback` puis `/dashboard`.
- **Rôle** : `getUserRole()` (api-client) → `"MENTOR" | "APPRENANT" | "ADMIN" | null`. Utilisé pour la nav et l’affichage conditionnel. Si ADMIN, redirection vers `/admin` et sidebar principale masquée.
- **Inscription / onboarding** : `customAuthClient.signUpEmail`, `customAuthClient.selectRole`, puis formulaires spécifiques (mentor ou apprenant). Mentor : `customAuthClient.saveMentorProfile`, `customAuthClient.publishProfile` / `unpublishProfile`.
- **Photo de profil** : `customAuthClient.uploadPhoto` (POST multipart vers le back).
- **Suppression de compte** : `customAuthClient.deleteAccount(reason?)`.

---

## 🧭 Flux d'Onboarding (Activation de compte)

Ce diagramme illustre le parcours d'un nouvel utilisateur jusqu'à l'accès à son dashboard.

```mermaid
flowchart TD
    Start[Inscription /login] --> Session[Session Créée]
    Session --> CheckRole{Rôle présent ?}
    CheckRole -->|Non| Onboarding[/onboarding]
    Onboarding --> Selection[Sélection MENTOR ou APPRENANT]
    Selection --> Form[Formulaire spécifique profil]
    Form --> Submit[Soumission API]
    Submit --> Success[Statut ACTIVE & Rôle fixé]
    Success --> Dashboard[/dashboard]
    CheckRole -->|Oui| Dashboard
```

---

## 📝 Pattern de Formulaire (Validation & Soumission)

L'application suit un pattern strict pour tous les formulaires (Profil, Ateliers, Paramètres).

```mermaid
flowchart LR
    User[Utilisateur] --> Input[Saisie Données]
    Input --> Zod{Validation Zod\nClient-side}
    Zod -->|Erreur| DisplayErr[Affichage message sous l'input]
    Zod -->|Valide| Mutation[trpc.useMutation]
    Mutation --> API[API tRPC Back]
    API -->|Succès| ToastS[Sonner : Toast Succès]
    API -->|Erreur| ToastE[Sonner : Toast Erreur]
    ToastS --> Redirect[Redirection ou Update Cache]
```

---

## 💬 Flux Messagerie & Temps Réel (Socket.IO)

Comment l'interface réagit aux événements live sans rechargement.

```mermaid
sequenceDiagram
    participant UI as Interface Chat
    participant Hook as useChatSocket
    participant S as Socket.IO Client
    participant B as Serveur Back
    participant Q as TanStack Query

    UI->>Hook: Montage du composant
    Hook->>S: Connexion & join-room(convId)
    
    Note over UI,B: Envoi d'un message
    UI->>B: tRPC messaging.sendMessage
    B->>S: Broadcast 'new-message'
    S->>Hook: Événement reçu
    Hook->>Q: Invalidation / Optimistic Update
    Q-->>UI: Nouveau message affiché
```

---

## Variables d’environnement

Fichier : `front/.env` (voir `front/.env.example`).

- **`NEXT_PUBLIC_SERVER_URL`** — URL du back (ex. `http://localhost:3000`). Utilisée par le client tRPC et par `auth-client` / `api-client` pour les appels API. Obligatoire en prod.

---

## Scripts (depuis la racine du repo)

- `pnpm dev:front` — Démarre le front en dev (port 3001).
- `pnpm dev` — Démarre front et back (Turborepo).

Build : `pnpm build` (à la racine lance le build des workspaces).

---

## Documentation

- [Architecture](architecture.md)
- [Back](back.md)
