# Schéma et procédure de déploiement

Documentation du déploiement LearnSup : architecture, Docker, CI/CD et procédures.

---

## Récapitulatif des schémas

| Schéma | Public | Description |
| ------ | ------ | ----------- |
| [Vue simplifiée](#vue-simplifiée-pour-non-techniques) | Tous | Infrastructure en 1 coup d'œil |
| [Flux de déploiement](#flux-de-déploiement-pour-non-techniques) | Tous | Mise à jour du site |
| [Déploiement production](#schéma-de-déploiement-production--technique) | Technique | Traefik, Docker, services |
| [Docker production](#schéma-docker-production) | Technique | Conteneurs et ports |
| [Environnements](#schéma-des-environnements) | Tous | Dev vs Prod |
| [Flux requête](#flux-dune-requête-production) | Technique | Parcours d'une action |
| [CI/CD](#schéma-des-flux-cicd-technique) | Technique | Pipeline GitHub Actions |
| [Routage Traefik](#schéma-de-routage-traefik) | Technique | URLs → services |
| [Crons](#schéma-des-crons) | Technique | Tâches planifiées |
| [Build Docker](#schéma-du-build-docker) | Technique | Code → conteneur |
| [Webhooks entrants](#schéma-des-webhooks-entrants) | Technique | Polar, Daily → Backend |
| [Variables d'environnement](#schéma-des-variables-denvironnement) | Technique | Répartition Front / Back / Traefik |
| [Réseau Docker](#schéma-du-réseau-docker-production) | Technique | Conteneurs sur vps-mds |
| [Flux d'intégration](#flux-dintégration) | Technique | PR, tests, merge, release |

---

## Flux d'intégration

*Intégration = merge du code. Déploiement = étape séparée, déclenchée par un tag.*

```mermaid
flowchart LR
  A[Push] --> B[Pull Request] --> C[Tests CI] --> D[Merge]
```

| Phase | Déclencheur | Action |
| ----- | ----------- | ------ |
| Intégration | Push / PR | Tests, merge |
| Deploy | Tag (manuel) | Build, déploiement |

## Vue simplifiée (pour non-techniques)

*Comment LearnSup fonctionne côté infrastructure — schéma lisible par tous.*

```mermaid
flowchart TB
  A[Utilisateur] --> B[Site web]
  B --> C[Serveur]
  C --> D[(Base de données)]
  C --> E[Paiement]
  C --> F[Emails]
  C --> G[Visioconférence]
```

**En résumé** : L'utilisateur utilise le site dans son navigateur. Le site dialogue avec le serveur, qui stocke tout dans la base de données et s'appuie sur des services externes (paiement, emails, visio).

---

## Flux de déploiement (pour non-techniques)

*Que se passe-t-il quand on met à jour LearnSup ?*

```mermaid
flowchart LR
  A[Nouvelle version] --> B[Construction]
  B --> C[Mise en ligne]
  C --> D[Site à jour]
```

**En résumé** : Le développeur valide une version → le système construit et met en ligne automatiquement → les utilisateurs voient la nouvelle version.

---

## Schéma de déploiement (production) — technique

```mermaid
flowchart TB
  subgraph Internet["Internet"]
    User[Utilisateur]
  end

  subgraph VPS["VPS / Serveur"]
    subgraph Traefik["Traefik (reverse proxy)"]
      TLS[HTTPS :443]
      ACME[Let's Encrypt]
    end

    subgraph Docker["Docker Compose"]
      App["app\n:3001\n(Front + API + Socket.IO)"]
    end

    subgraph External["Externe"]
      DB[(PostgreSQL)]
    end
  end

  subgraph Services["Services tiers"]
    Polar[Polar]
    Resend[Resend]
    Daily[Daily.co]
    Cloudinary[Cloudinary]
    Sentry[Sentry]
  end

  User -->|HTTPS| TLS
  TLS --> App
  App --> DB
  App --> Polar
  App --> Resend
  App --> Daily
  App --> Cloudinary
  App --> Sentry
  TLS -.->|ACME| ACME
```

---

## Schéma Docker (production)

*Disposition des conteneurs sur le serveur.*

```mermaid
flowchart TB
  subgraph Serveur
    T[Traefik\nPort 443]
    A[App\nPort 3001]
  end
  DB[(PostgreSQL\nexterne)]
  T --> A
  A --> DB
```

---

## Schéma des environnements

*Comparaison Dev local, Dev Docker et Production.*

```mermaid
flowchart LR
  A[Dev local] --> B[Dev Docker] --> C[Production]
```

| Environnement | App | Base | Accès |
| ------------- | --- | ---- | ----- |
| Dev local | :3001 | Local | localhost |
| Dev Docker | :3001 | .env | localhost |
| Production | :3001 | Externe | HTTPS |

---

## Architecture des services

| Service | Image | Port interne | Rôle |
| ------- | ----- | ------------ | ---- |
| **app** | `miho11/front_ls:latest` | 3001 | Application Next.js Unifiée (Client + API + Socket.IO) |
| **traefik** | `traefik:v3.2.1` | 80, 443 | Reverse proxy, TLS, routage |

**App** : un seul processus sert le Front, l'API HTTP et Socket.IO (port 3001, path `/socket.io`).

---

## Environnements

### Développement local

- **Commande** : `pnpm dev` (Turborepo)
- **App** : `http://localhost:3001`
- **Socket.IO** : même URL (`/socket.io`)
- **Base** : PostgreSQL local (`pnpm db:push`)

### Développement Docker

- **Fichier** : `infra/docker/Docker-compose-dev.yml`
- **Services** : app, Prometheus, Grafana
- **Réseau** : `app-network`
- **Commandes** : `docker compose -f Docker-compose-dev.yml up -d`

### Production (Docker)

- **Fichier** : `infra/docker/docker-compose-prod.yml`
- **Services** : app, traefik
- **Réseau** : `vps-mds` (externe)
- **Images** : Docker Hub `miho11/front_ls`

---

## Flux d'une requête (production)

*Parcours d'une action utilisateur jusqu'à la base de données.*

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant T as Traefik
  participant A as App
  participant D as Base de données
  U->>T: HTTPS
  T->>A: Page web / API
  A->>D: Requête
  D->>A: Données
  A->>T: Réponse
  T->>U: Mise à jour
```

---

## Schéma des flux CI/CD (technique)

```mermaid
flowchart LR
  subgraph GitHub["GitHub"]
    Tag["Tag vX.Y.Z"]
    Push["Push"]
  end

  subgraph Actions["GitHub Actions"]
    BuildApp["Build & Push App"]
    Deploy["Deploy via SSH"]
  end

  subgraph Registry["Docker Hub"]
    ImgApp["miho11/front_ls"]
  end

  subgraph VPS["VPS"]
    Pull["docker compose pull"]
    Up["docker compose up -d"]
  end

  Tag --> BuildApp
  BuildApp --> ImgApp
  ImgApp --> Deploy
  Deploy --> Pull
  Pull --> Up
```

**Déclencheur** : push d’un tag `X.Y.Z` (ex. `5.1.1`).

---

## Schéma du build Docker

*De la source au conteneur en production.*

```mermaid
flowchart LR
  S[Code source] --> B[Build image]
  B --> R[Docker Hub]
  R --> V[VPS pull]
  V --> C[Conteneur]
```

---

## 🔄 Flux détaillé du Déploiement (CI/CD)

Ce diagramme illustre le parcours complet depuis la création d'un tag sur GitHub jusqu'à la mise en ligne effective.

```mermaid
sequenceDiagram
  participant Dev as Développeur
  participant GH as GitHub (Tag)
  participant GHA as GitHub Actions
  participant DH as Docker Hub
  participant VPS as Serveur VPS
  participant DB as PostgreSQL

  Dev->>GH: git tag vX.Y.Z && git push origin --tags
  GH->>GHA: Déclenchement du workflow release.yml
  
  activate GHA
  GHA->>GHA: Checkout code & setup environment
  GHA->>GHA: Build images Docker (Multi-stage / Alpine)
  GHA->>DH: Push images (:latest & :vX.Y.Z)
  GHA-->>VPS: Connexion SSH (Appleboy Action)
  deactivate GHA

  activate VPS
  VPS->>VPS: cd /infra/docker
  VPS->>VPS: git pull (mise à jour des configs)
  VPS->>DH: docker compose pull (récupération des images)
  VPS->>VPS: docker compose up -d
  
  Note over VPS,DB: Phase de démarrage (Entrypoint)
  VPS->>VPS: Lancement de back/start.sh
  VPS->>DB: prisma migrate deploy (SQL)
  DB-->>VPS: Succès / Déjà à jour
  VPS->>VPS: node server.ts (Démarrage API)
  deactivate VPS
  
  Note over Dev,VPS: Système à jour et fonctionnel
```

---

## 🔄 Flux de Rollback (Retour arrière)

En cas d'erreur critique après un déploiement, voici la procédure de secours pour revenir à la version précédente.

```mermaid
flowchart TD
  Error[Erreur critique détectée] --> Decision{Rollback nécessaire ?}
  Decision -->|Oui| SSH[Connexion SSH au VPS]
  Decision -->|Non| Fix[Investigation & Correctif à chaud]
  SSH --> CD[cd /infra/docker]
  CD --> Edit[Modifier docker-compose-prod.yml]
  Edit --> Version[Remplacer :latest par :vX.Y.prev]
  Version --> Up[docker compose up -d]
  Up --> Verify[Vérification santé application]
  Verify -->|OK| Log[Analyse des logs de la version défaillante]
  Fix --> Log
```

---

## 📊 Flux de Monitoring & Observabilité

Comment les données de santé et les erreurs circulent depuis les conteneurs.

```mermaid
flowchart LR
  subgraph Production["Conteneurs Prod"]
    Back[Backend]
    Front[Frontend]
  end

  subgraph Observability["Observabilité"]
    Sentry[Sentry.io]
    Prom[Prometheus]
    Graf[Grafana]
  end

  Front -->|Erreurs JS / Hydratation| Sentry
  Back -->|Exceptions / Tracing / SQL| Sentry
  Back -->|Expose /api/metrics| Prom
  Prom -->|Pull métriques| Graf
  Sentry -->|Alertes Slack/Email| Dev[Développeur]
```

---

## 🔒 Flux de Renouvellement SSL Automatique

Gestion des certificats HTTPS via Traefik et Let's Encrypt.

```mermaid
sequenceDiagram
  participant User as Utilisateur
  participant T as Traefik
  participant LE as Let's Encrypt
  participant F as Frontend / Backend

  User->>T: Requête HTTPS (port 443)
  alt Certificat valide
    T->>F: Transmet la requête
  else Certificat expiré ou absent
    T->>LE: Demande de challenge ACME (HTTP-01)
    LE->>T: Vérification du domaine
    T-->>LE: Réponse au challenge
    LE->>T: Délivrance du certificat SSL
    T->>T: Stockage dans acme.json
    T->>F: Transmet la requête sécurisée
  end
```

---

## 🛠️ Build Docker local (test)

*Pour tester l'image de production sur votre propre machine avant de pousser un tag.*

### Build Backend
```bash
docker build -t ls-back-local -f infra/docker/back/prod/Dockerfile .
```

### Build Frontend
```bash
docker build -t ls-front-local -f infra/docker/front/prod/Dockerfile .
```

### Lancer les images localement
Vous devez passer les variables d'environnement nécessaires via un fichier `.env.prod` :
```bash
docker run --env-file .env.prod -p 4500:4500 ls-back-local
```

---

## 💾 Gestion de la Base de Données

### Migrations en Production
Dans LearnSup, les migrations ne sont pas effectuées par la CI GitHub Actions. Elles sont **déclenchées au lancement du conteneur backend**.

Le point d'entrée du conteneur (`CMD ["./start.sh"]`) exécute les étapes suivantes :
1. `npx prisma migrate deploy` : Applique toutes les migrations SQL en attente de manière sécurisée (sans perte de données).
2. `node server.ts` : Démarre le serveur tRPC + Socket.IO.

**Important** : Ne jamais utiliser `prisma db push` en production, car cela pourrait entraîner une perte de données si les schémas sont désynchronisés.

---

## Pipeline de déploiement

| Étape | Workflow | Action |
| ----- | -------- | ------ |
| 1 | `release.yml` | Déclenché par tag `[0-9]+.[0-9]+.[0-9]+` |
| 2 | Build App | Build Docker `infra/docker/app/prod/Dockerfile` → push `miho11/front_ls:latest` |
| 3 | Deploy | SSH vers VPS → `git pull` → `docker compose -f docker-compose-prod.yml up -d` |

**Secrets GitHub** : `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SSH_HOST`, `SSH_USERNAME`, `SSH_PASSWORD`.

---

## Variables d'environnement (production)

### Application Unifiée (App)

| Variable | Description |
| -------- | ----------- |
| `NEXT_PUBLIC_SERVER_URL` | URL publique de l'app (ex. `https://app.learnsup.example.com`) |
| `NEXT_PUBLIC_SOCKET_URL` | URL de l'app (Socket.IO sur le même host) |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN Sentry (optionnel) |
| `SENTRY_AUTH_TOKEN` | Token Sentry pour upload sourcemaps (build) |
| `DATABASE_URL` | URL PostgreSQL |
| `CORS_ORIGIN` | Origine autorisée |
| `CRON_SECRET` | Secret pour les routes `/api/cron/*` |
| `BETTER_AUTH_SECRET` | Secret Better Auth (min 32 caractères) |
| `BETTER_AUTH_URL` | URL publique de l'app (ex. `https://app.learnsup.fr/api/auth`) |
| `PORT` | 3001 |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Emails (Resend) |
| `SEND_EMAILS` | `true` / `false` |
| `DAILY_API_KEY`, `DAILY_DOMAIN`, `DAILY_WEBHOOK_SECRET` | Visio (Daily.co) |
| `CLOUDINARY_*` | Stockage images |
| `POLAR_*` | Paiement (Polar) |

### Traefik / Compose

| Variable | Description |
| -------- | ----------- |
| `FRONT_IMAGE_TAG` | Tag de l'image (ex. latest) |

---

## Fichiers de déploiement

| Fichier | Rôle |
| ------- | ---- |
| `infra/docker/docker-compose-prod.yml` | Compose production (app, traefik) |
| `infra/docker/Docker-compose-dev.yml` | Compose dev (app, Prometheus, Grafana) |
| `infra/docker/app/prod/Dockerfile` | Image app production |
| `infra/docker/app/Dockerfile.dev` | Image app dev |
| `.github/workflows/release.yml` | CI/CD : build, push, deploy |
| `app/start.sh` | Script de démarrage app (migrations + serveur) |

---

## Procédure de déploiement manuel

### 1. Déployer une nouvelle version (tag)

```bash
# Créer et pousser un tag
git tag 5.2.0
git push origin 5.2.0
```

Le workflow `release.yml` se lance automatiquement.

### 2. Déploiement manuel sur le VPS

```bash
# Sur le VPS
cd /home/root/projects/learnsup-app/ls_app/infra/docker
git pull
docker compose -f docker-compose-prod.yml pull
docker compose -f docker-compose-prod.yml up -d --remove-orphans
```

### 3. Vérifier les migrations

Le script `back/start.sh` exécute `prisma migrate deploy` au démarrage du backend. Les migrations sont appliquées automatiquement.

### 4. Crons

Configurer un planificateur (cron système ou GitHub Actions) pour appeler les routes `/api/cron/*` avec le header `CRON_SECRET`. Voir [procedure.md](procedure.md#crons-jobs-planifiés).

---

## Schéma de routage Traefik

*Comment les URLs sont dirigées vers les bons services.*

```mermaid
flowchart LR
  A[app.learnsup.com] --> T[Traefik]
  B[api.learnsup.com] --> T
  T --> F[Frontend 3001]
  T --> K[Backend 4500]
```

---

## Schéma des crons

*Les tâches planifiées appelées par un planificateur externe.*

```mermaid
flowchart TB
  P[Planificateur\ncron / GitHub Actions] --> C[/api/cron/*]
  C --> J1[Cashback]
  C --> J2[Purge suppressions]
  C --> J3[Notifications feedback]
  C --> J4[Nettoyage visio]
```

---

## Schéma des webhooks entrants

*Flux des callbacks envoyés par les services externes vers le backend.*

```mermaid
flowchart LR
  P[Polar] -->|Paiement réussi| B[Backend]
  D[Daily.co] -->|Participant salle| B
```

| Webhook | URL | Événement | Action |
| ------- | --- | --------- | ------ |
| Polar | `/api/polar/webhook` | Paiement réussi | Crédit du compte |
| Daily.co | `/api/daily/webhook` | Participant rejoint/quitte | Mise à jour activité salle |

---

## Schéma des variables d'environnement

*Répartition des variables par service.*

```mermaid
flowchart TB
  subgraph Front["Frontend"]
    A[URL serveur]
    B[URL socket]
    C[Sentry]
  end
  subgraph Back["Backend"]
    D[Database]
    E[Auth]
    F[Resend Daily Cloudinary Polar]
    G[CRON_SECRET]
  end
  subgraph Compose["Compose"]
    H[FRONTEND_URL]
    I[BACKEND_URL]
  end
```

---

## Schéma du réseau Docker (production)

*Conteneurs sur le réseau vps-mds et liens entre eux.*

```mermaid
flowchart TB
  subgraph vps["Réseau vps-mds"]
    T[Traefik\n443]
    F[Frontend\n3001]
    B[Backend\n4500]
  end
  T --> F
  T --> B
  F --> B
```

Le compose prod utilise le réseau externe `vps-mds`. Créer le réseau si nécessaire :

```bash
docker network create vps-mds
```

---

## Références

- [Procédure](procedure.md) — Démarrage, DB, auth, crons
- [Architecture](architecture.md) — Flux et schémas
- [Back](back.md) — API et variables d’env
