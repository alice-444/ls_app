# Documentation technique LearnSup

ce qui existe et où le trouver

---

## Sommaire

- [README principal](../README.md) — Installation et quick start
- [Stack technique](tech-stack.md) — Technologies, langages et choix technologiques
- [Fonctionnalités](feat.md) — Fonctionnalités produit par rôle et par domaine
- [Architecture](#architecture) – Vue d’ensemble front/back
- [Temps Réel](realtime.md) – Socket.IO, événements et rooms
- [Design Patterns](patterns.md) – Patterns utilisés dans le projet
- [Sécurité & RGPD](security.md) – Politique de sécurité et protection des données
- [App](#app) – Application Next.js, tRPC, auth
- [Back](#back) – API, Prisma, auth
- [Arborescence](#arborescence) – Structure macro et micro
- [Guides](#guides) – Procédures (déploiement, DB, auth…), PV de recette, schéma déploiement
- [Référence](#référence) – Détails techniques par domaine

---

## Fonctionnalités

Documentation des fonctionnalités produit (vue fonctionnelle par rôle) : [feat.md](feat.md).

---

## Architecture

Vue d’ensemble du monorepo (front, back, DB) : [architecture.md](architecture.md).
Patterns de conception et principes SOLID appliqués : [patterns.md](patterns.md).
**Temps Réel & Socket.IO** : [realtime.md](realtime.md) — catalogue des événements, rooms et résilience.
**Modèle physique de données (MPD)** : [mpd.md](mpd.md) — tables, colonnes, types, clés, index.
Inclut les flux d'authentification, utilisateur, données, atelier, paiement, messagerie, visio, suppression compte, crons et réseau.

---

## Arborescence

Structure macro (racine, app, back, infra) et micro (dossiers, fichiers) : [arborescence.md](arborescence.md).

---

## App

Documentation de l’application frontend : [app.md](app.md).

---

## Back

Documentation de l’API et du serveur : [back.md](back.md).

---

## Guides

Procédures (déploiement, DB, auth…) : [procedure.md](procedure.md).
Schéma et procédure de déploiement : [deploiement.md](deploiement.md).
Procès-verbal de recette : [pv-recette.md](pv-recette.md).

---

## Référence

Détails techniques par domaine : [reference.md](reference.md).