# LearnSup – Architecture du système

Document de référence pour l’IA : vue d’ensemble du monorepo (front, back, base de données). Détails complets dans `docs/architecture.md` à la racine du repo.

---

## Vue d’ensemble

- **Front** : Next.js 16 (App Router), port 3001 en dev. tRPC client + Better Auth client + Fetch pour API custom + Socket.IO client.
- **Back** : Next.js servi par un serveur HTTP Node (CORS, Socket.IO). Port 3002 en dev serveur, 4500 par défaut. Routes : `/trpc`, `/api/auth/*`, `/api/profile/*`, `/api/sign-up`, `/api/sign-in`, `/api/onboarding/*`, `/api/cron/*`, webhooks (Daily, Polar), `/api/metrics`.
- **Base** : PostgreSQL. Schéma et migrations dans `back/prisma/schema/schema.prisma`.

---

## Schéma système

```mermaid
flowchart LR
  subgraph Front["Front (Next.js :3001)"]
    UI[Pages / UI]
    tRPC_C[tRPC client]
    AUTH_C[Better Auth client]
    FETCH[Fetch API]
    SOCKET_C[Socket.IO client]
  end

  subgraph Back["Back (Next.js :4500)"]
    HTTP[Serveur HTTP + CORS]
    NEXT[Next.js handler]
    TRPC[/trpc]
    AUTH[/api/auth/*]
    API[/api/profile, sign-up, cron…]
    SOCKET_S[Socket.IO]
    PRISMA[Prisma]
  end

  subgraph DB[(PostgreSQL)]
  end

  UI --> tRPC_C
  UI --> AUTH_C
  UI --> FETCH
  UI --> SOCKET_C
  tRPC_C --> TRPC
  AUTH_C --> AUTH
  FETCH --> API
  SOCKET_C <--> SOCKET_S
  HTTP --> NEXT
  NEXT --> TRPC
  NEXT --> AUTH
  NEXT --> API
  NEXT --> SOCKET_S
  TRPC --> PRISMA
  AUTH --> PRISMA
  API --> PRISMA
  PRISMA --> DB
```

---

## Ports et URLs en dev

- **Front** : `http://localhost:3001`
- **Back** : `http://localhost:4500` (Cypress baseUrl) ou 3002 selon config. Variable front : `NEXT_PUBLIC_SERVER_URL`.
- **Socket.IO** : même origine que le back, path `/socket.io`.

---

## Fonctionnalités métier

- **Authentification** : Better Auth (email/mot de passe, sessions, cookies). Routes custom : `/api/sign-up`, `/api/sign-in`, `/api/onboarding/select-role`. Profil mentor : `/api/profile/role/prof`, upload photo, publish.
- **Ateliers (workshops)** : création, édition, publication, demandes (accept/refuse), feedbacks, cashback, analytics. Visio Daily.co (liens back, webhooks).
- **Mentors / Apprenants** : profils mentors publiés, catalogue ateliers, demandes, historique, connexions (réseau).
- **Messagerie** : conversations, messages, réactions, épingles. Temps réel Socket.IO.
- **Notifications** : in-app, Socket.IO + tRPC `notification.*`.
- **Crédits** : solde, transactions, achats Polar, webhook back.
- **Modération** : user block, user report (tRPC `userBlock.*`, `userReport.*`).
- **Support** : formulaire, pièces jointes, email Resend. Route `/api/support-request`.
- **Admin** : modération feedbacks (page `/admin/feedback-moderation`).
- **Métriques** : `/api/metrics` (Prometheus).

---

## Flux principaux

1. **Données** : front → tRPC (`trpc.*.useQuery` / `useMutation`) avec `credentials: "include"` → back → Prisma → PostgreSQL.
2. **Auth** : Better Auth (`/api/auth/*`) + routes custom ; session (cookie) pour procédures protégées. Back : `getAuthenticatedSession(req)` dans les routes API.
3. **Temps réel** : Socket.IO client (front) ↔ serveur (back) pour messagerie et notifications.

---

## Routers tRPC (back)

Définis dans `back/src/routers/index.ts` : `healthCheck`, `privateData`, `workshop`, `workshopFeedback`, `mentor`, `apprentice`, `connection`, `messaging`, `notification`, `userBlock`, `userReport`, `credits`, `user`, `cashbackAnalytics`, `accountSettings`. Détail des procédures dans chaque sous-router (`back/src/routers/workshops/`, `mentors/`, `users/`, `social/`, etc.).

---

## Références

- Schéma de données : [database.md](database.md)
- Services back : [services.md](services.md)
- Patterns : [patterns.md](patterns.md)
- Composants front : [components.md](components.md)
- Doc complète (racine) : `docs/architecture.md`, `docs/front.md`, `docs/back.md`
