# Métier, limites et exploitation

Complément à [architecture.md](architecture.md) et [reference.md](reference.md) : règles métier utiles au debug, intégrations externes, rate limiting et pistes de dépannage. Le code vit dans le package **`app/`** (Next.js + tRPC + Prisma).

---

## Crédits et demandes d’atelier

- **Coût d’une demande** : **10 crédits** débités en transaction lors de la soumission (`WorkshopRequestService`, constante `WORKSHOP_REQUEST_COST`). Échec du débit → pas de création de `workshop_request`.
- **Remboursements / ajustements** : logique dispersée dans les services atelier et crédits (rejet de demande, annulation, etc.) — voir `CreditService` et flux `mentor.rejectRequest` / annulation dans le code.
- **Paiement Polar → crédits** : webhook `POST /api/polar/webhook` — événements `checkout.succeeded` / `checkout.completed`. Métadonnées requises sur le checkout : **`userId`**, **`credits`** (montant entier > 0). Statut checkout attendu : `paid` ou `succeeded`.
- **Idempotence Polar** : avant crédit, recherche d’une transaction `TOP_UP` existante dont la description contient l’**id du checkout** ; si trouvée → réponse `alreadyProcessed: true` (évite un double crédit si Polar renvoie le même webhook).
- **Échecs** : signature invalide → 400 ; métadonnées manquantes → 400 ; `creditService.creditCredits` en échec → 500 (à surveiller en logs).

### Schéma — soumission demande d’atelier (débit 10 crédits)

```mermaid
sequenceDiagram
  participant A as Apprenant (client)
  participant T as tRPC mentor.submitWorkshopRequest
  participant S as WorkshopRequestService
  participant C as CreditService
  participant DB as PostgreSQL

  A->>T: soumission (mentorId, titre, …)
  T->>S: submitWorkshopRequest
  S->>DB: $transaction
  Note over S,DB: Une seule transaction
  S->>C: debitCreditsInTransaction(10 crédits)
  alt Solde insuffisant / erreur débit
    C-->>S: échec
    S-->>T: erreur
    T-->>A: pas de workshop_request
  else Débit OK
    C->>DB: credit_transaction USAGE / solde
    S->>DB: INSERT workshop_request
    DB-->>S: OK
    S-->>T: requestId
    T-->>A: succès
  end
```

### Schéma — webhook Polar → crédit compte (idempotence)

```mermaid
flowchart TD
  P[Polar POST /api/polar/webhook] --> V{Signature valide ?}
  V -->|Non| E400[400]
  V -->|Oui| T{Type checkout.succeeded / completed ?}
  T -->|Non| OK204[200 received]
  T -->|Oui| M{metadata userId + credits ?}
  M -->|Non| E400b[400]
  M -->|Oui| ST{status paid / succeeded ?}
  ST -->|Non| E400c[400 warn]
  ST -->|Oui| I{TOP_UP existant avec checkout.id dans description ?}
  I -->|Oui| DUP[200 alreadyProcessed]
  I -->|Non| CR[creditService.creditCredits]
  CR -->|échec| E500[500]
  CR -->|OK| MAIL[Email confirmation optionnel]
  MAIL --> OK[200 + transactionId]
```

---

## Communauté (`community` tRPC)

- Router : `app/src/routers/social/community.router.ts` — hub, votes, propositions, modération (dont actions bulk côté admin).
- **Rôles** : la plupart des actions nécessitent une session ; création / modération avancée réservée aux **ADMIN** selon les procédures (voir `adminProcedure` dans les routers admin).
- Pour le détail des procédures exposées : [reference.md](reference.md) § API (tRPC).

### Schéma — accès simplifié (communauté vs admin)

```mermaid
flowchart LR
  subgraph Public["Utilisateur connecté"]
    U[Lecture hub / votes / contenus publics]
  end
  subgraph Admin["ADMIN"]
    M[Modération bulk / création directe / proposals]
  end
  U --> R[community.router]
  M --> R
  M --> AR[admin.router]
  R --> SVC[Services + Prisma]
  AR --> SVC
```

---

## Admin, audit et support

- **Admin** : router `app/src/routers/admin/admin.router.ts` — stats, onboarding, utilisateurs, Fiche 360°, crédits, notifications segmentées, bulk, etc.
- **Audit** : actions sensibles enregistrées via `AuditLogService` (voir schéma `audit_log`).
- **Support** : router `support` + routes `/api/support-request` — fils threadés côté produit.

### Schéma — pistes d’audit et support

```mermaid
flowchart TB
  subgraph AdminUI["Interface /admin"]
    A1[Actions modération / crédits / bulk notif]
  end
  subgraph API["tRPC / API"]
    AD[admin.router]
    SU[support.router]
    SR["/api/support-request"]
  end
  subgraph Persistance["Données"]
    AL[(audit_log)]
    DB[(support_request, messages, …)]
  end
  A1 --> AD
  AD --> AL
  AD --> DB
  SU --> DB
  SR --> DB
```

---

## Rate limiting (tRPC et API)

- Implémentation : `app/src/lib/rate-limit/` — `rate-limiter-flexible`, stockage **PostgreSQL** si pool disponible, sinon **mémoire** (dev).
- **Mutations tRPC** (`rateLimitMutation`) : **10** requêtes / **60 s** par identifiant (`user:{id}` ou `ip:…`).
- **Requêtes lourdes / API** (`rateLimitQuery`) : **100** / **60 s**.
- **Auth / export** (`authRateLimiter` dans `rate-limit.ts`) : **5** / **60 s** — utilisé sur les flux sensibles (voir [security.md](security.md)).
- Réponse typique : erreur tRPC `TOO_MANY_REQUESTS` avec délai conseillé ; routes REST peuvent renvoyer **429** avec en-têtes `X-RateLimit-*` (`applyRateLimit`).

### Schéma — identifiant puis bon limiteur (fenêtre 60 s)

Même **clé** (`user:…`, `ip:…` ou `anonymous`) pour tous les limiteurs ; selon la route, un seul limiteur est consulté.

```mermaid
flowchart TB
  REQ[Requête] --> ID["getRateLimitIdentifier(userId, ip)"]
  ID --> KEY["Clé: user:id → ip:x → anonymous"]
  KEY --> BR{Garde-fou utilisé ?}
  BR -->|Mutations tRPC| LM["mutationRateLimiter — 10 / 60 s"]
  BR -->|Queries / API| LQ["apiRateLimiter — 100 / 60 s"]
  BR -->|Auth / export| LA["authRateLimiter — 5 / 60 s"]
  LM --> Q{Quota OK ?}
  LQ --> Q2{Quota OK ?}
  LA --> Q3{Quota OK ?}
  Q -->|Non| E429["TOO_MANY_REQUESTS ou HTTP 429"]
  Q -->|Oui| OK[Suite du handler]
  Q2 -->|Non| E429
  Q2 -->|Oui| OK
  Q3 -->|Non| E429
  Q3 -->|Oui| OK
```

---

## Variables d’environnement (rappel)

- **Source de vérité commitée** : `app/.env.example` (variables publiques front). Les secrets (`DATABASE_URL`, `BETTER_AUTH_*`, `CRON_SECRET`, `DAILY_*`, `POLAR_*`, `RESEND_*`, `CLOUDINARY_*`, etc.) sont documentés dans l’équipe / hébergeur — ne pas les commiter.
- **CORS** : `CORS_ORIGIN` doit inclure l’origine du front (ex. `http://localhost:3001` en dev).

---

## Dépannage rapide

| Symptôme | Pistes |
|----------|--------|
| Pas de salle Daily / pas de `dailyRoomId` | Cron `GET/POST /api/cron/generate-video-links` (secret `CRON_SECRET`) ; atelier **virtuel**, **publié**, sans salle, début dans les **12 h** ; clés `DAILY_*` valides. |
| Visio “accès refusé” sur Daily | Vérifier **`nbf` / `exp`** de la room (créneau atelier) ; rooms anciennes peuvent avoir une config obsolète jusqu’à recréation. |
| Crédits Polar non attribués | Logs webhook ; signature `polar-signature` / `x-polar-signature` ; métadonnées `userId` + `credits` ; doublon idempotent (déjà traité). |
| 429 sur tRPC | Rate limit — espacer les appels ou authentifier (identifiant user). |
| Migrations prod | `app/start.sh` exécute `prisma migrate deploy` si `NODE_ENV=production`. |

---

## Tests (Vitest)

- Les tests unitaires actuels sont principalement sous **`app/__tests__/units/`** (pas de dossier `back/__tests__` dans ce monorepo).
- Lancer : `pnpm test` ou `pnpm test:coverage` à la racine (Turborepo → workspace `app`).

---

## Liens

- [Arborescence](arborescence.md) — chemins `app/src/…`
- [Procédures](procedure.md) — DB, crons, déploiement
- [Back (API)](back.md) — entrée HTTP, routers, stack
