# Documentation technique LearnSup

ce qui existe et où le trouver

---

## Sommaire

- [README principal](../README.md) - installation et le quick start
- [Architecture](#architecture) – Vue d’ensemble front/back
- [PRD & EPTC](#prd--eptc) – Cahier des charges et plan de tests E2E (contexte Gemini)
- [Front](#front) – Application Next.js, tRPC, auth
- [Back](#back) – API, Prisma, auth
- [Guides](#guides) – Procédures (déploiement, DB, auth…)
- [Référence](#référence) – Détails techniques par domaine

---

## Architecture

Vue d’ensemble du monorepo (front, back, DB) : [architecture.md](architecture.md). Inclut les flux d'authentification, flux utilisateur et flux de données.

---

## PRD & EPTC

Documents dédiés aux assistants IA (Gemini, Claude, etc.), dans **`ai_docs/`** :

- **PRD** (cahier des charges, découpé) : [ai_docs/PRD/](../ai_docs/PRD/) – README, PRD-00 vision/users, PRD-01 périmètre, PRD-02 exigences
- **EPTC** (plan de tests E2E, découpé) : [ai_docs/EPTC/](../ai_docs/EPTC/) – README, back santé, accueil-auth, dashboard-workshops, pages secondaires, priorisation
- **Contexte Gemini** : [gemini-context.md](../ai_docs/gemini-context.md) – quels docs fournir à l’IA, résumé copier-coller
- **Index des documents** : [ai_docs/gemini/00-index-documents.md](../ai_docs/gemini/00-index-documents.md) – liste complète ; [01-prompts-exemples.md](../ai_docs/gemini/01-prompts-exemples.md) – exemples de prompts
- **Doc technique IA** : [ai_docs/docs/](../ai_docs/docs/) – architecture, services, patterns, database, components
- **PRP Flow & PRPs** : [concept_library/cc_PRP_flow/](../ai_docs/concept_library/cc_PRP_flow/) – template + PRPs (auth, workshop catalogue, dashboard)

---

## Front

Documentation de l’application frontend : [front.md](front.md).

---

## Back

Documentation de l’API et du serveur : [back.md](back.md).

---

## Guides

Procédures (déploiement, DB, auth…) : [procedure.md](procedure.md).

---

## Référence

Détails techniques par domaine : [reference.md](reference.md).