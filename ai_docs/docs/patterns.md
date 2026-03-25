# LearnSup – Design patterns et conventions

Patterns et conventions du projet pour l’IA. Stack réelle : **Next.js (front + back), TypeScript, tRPC, Prisma, Better Auth, Socket.IO** (pas de Spring Boot ni Java).

---

## Backend (Next.js API + tRPC)

### 1. Routes API (App Router)

- **Emplacement** : `back/src/app/api/**/route.ts`.
- **Auth** : pour les routes protégées, appeler `getAuthenticatedSession(req)` (depuis `@/lib/api-helpers`). Si `!authResult.ok`, retourner `authResult.response`. Sinon utiliser `authResult.userId` et `authResult.session`.
- **Body JSON** : `parseJsonBodySafe(req)` ou `parseJsonBody(req)` (depuis `@/lib/api-helpers`) pour parser et valider. Gérer le cas `!bodyResult.ok` en retournant `bodyResult.response`.
- **Réponse** : déléguer à un **service** (classe ou fonction), puis `handleServiceResult(result)` pour transformer un `Result<T>` en `NextResponse`. En cas d’exception : `handleRouteError(error)`.
- **Rate limiting** : `applyRateLimit(rateLimitConfig, userId)` quand applicable (ex. onboarding).

Exemple de structure :

```ts
// route.ts
const result = await someService.execute(body, req.headers);
return handleServiceResult(result);
```

### 2. Type Result (service layer)

- Les services retournent un type `Result<T>` : `{ ok: true, data }` ou `{ ok: false, error, status? }`. Défini dans `back/src/lib/common` (ou équivalent). `handleServiceResult` mappe vers 200 + JSON ou 4xx + error.

### 3. Service + Repository

- **Services** : logique métier, validation, orchestration. Dans `back/src/lib/*/services/`. Ils s’appuient sur des **repositories** (interfaces dans `*repository.interface.ts`, implémentations Prisma dans `*repository.ts`).
- **Injection** : services instanciés avec des repos (ex. `new SignUpService(appUserRepository)`). Pas de DI container obligatoire pour les routes ; instanciation directe ou via container dans `back/src/lib/di/`.

### 4. tRPC

- **Routers** : `back/src/routers/`. Procédures `publicProcedure` ou `protectedProcedure` (avec `ctx.session`). Utiliser les services/repos pour la logique.
- **Contexte** : le contexte tRPC contient la session (Better Auth) pour les procédures protégées. Vérifier le rôle (MENTOR, APPRENANT) si nécessaire.
- **Export** : `appRouter` et type `AppRouter` dans `routers/index.ts` pour le client front.

### 5. Prisma

- Client : `prisma` depuis `@/lib/common` (ou `@/lib/prisma`). Schéma dans `back/.prisma/schema/schema.prisma`. Pas de raw SQL sauf besoin explicite ; privilégier les requêtes Prisma typées.

---

## Frontend (Next.js App Router)

### 1. Server Components vs Client Components

- **Server Components** par défaut : pour les pages en lecture seule, SEO, réduction du bundle.
- **Client Components** (`"use client"`) : formulaires, dashboards, interactivité, hooks (useState, tRPC, authClient). Ex. : `SignInForm`, `ApprenantDashboard`, `WorkshopCard`.

### 2. Données et tRPC

- Client tRPC : `front/src/utils/trpc.ts` (React Query + tRPC). Hooks : `trpc.workshop.xxx.useQuery()`, `trpc.mentor.xxx.useMutation()`. Les requêtes partent vers `NEXT_PUBLIC_SERVER_URL/trpc` avec `credentials: "include"`.
- Auth : `authClient` (Better Auth) dans `front/src/lib/auth-client.ts`. `authClient.useSession()` pour l’état session. Redirection login/dashboard/onboarding selon rôle.

### 3. Formulaires

- **Tanstack Form** (`@tanstack/react-form`) + **zod** pour la validation (validators onSubmit). Ex. : `sign-in-form.tsx`, `sign-up-form.tsx`. Soumission async, toast (sonner) pour succès/erreur, `router.push()` après succès.

### 4. Composition et layout

- Layouts : `app/layout.tsx`, layouts par section si besoin. Composants de layout : `PageContainer`, `PageHeader`, `PageCard`, `SectionSidebar`, `Header`, `Sidebar`, `Footer`. Composants UI réutilisables dans `components/ui/` (style shadcn/ui).

### 5. Conventions de code

- **Langue** : commentaires en **anglais**, messages utilisateur et documentation produit en **français**.
- **Naming** : camelCase (TypeScript/JS), noms de tables/champs Prisma en snake_case côté DB (Prisma mappe automatiquement).
- **Fichiers** : kebab-case pour les fichiers de composants (ex. `sign-in-form.tsx`), PascalCase pour les noms de composants exportés.

---

## Sécurité

- Pas de secrets en frontend ; `NEXT_PUBLIC_*` uniquement pour des valeurs non sensibles (URL back, etc.).
- Côté back : toujours vérifier la session (ou le token) pour les routes et procédures protégées ; vérifier le rôle ou l’ownership (ex. mentor du workshop, apprenant de la demande) avant d’autoriser une action.
- Validation des entrées : zod (ou schémas partagés) côté back pour les routes API ; schémas tRPC pour les inputs des procédures.

---

## Références dans le repo

- Helpers API : `back/src/lib/api-helpers/` (auth.ts, json-parser, result-handler, rate-limit, error-handling).
- Exemple de route : `back/src/app/api/sign-up/route.ts`, `back/src/app/api/onboarding/select-role/route.ts`.
- Exemple de formulaire : `front/src/components/sign-in-form.tsx`, `front/src/components/sign-up-form.tsx`.
- Routers : `back/src/routers/index.ts`, `back/src/routers/workshops/`, `back/src/routers/mentors/`, `back/src/routers/users/`, `back/src/routers/social/`.
