# EPTC – Index et vue d’ensemble

**Plan de tests E2E et critères d’acceptation** pour LearnSup, découpé par domaine pour un contexte IA séquencé.

## Objectif

- Décrire les **scénarios E2E** (Cypress) et **critères d’acceptation** par zone fonctionnelle.
- Permettre à l’IA (Gemini) de générer ou compléter des specs Cypress cohérentes avec le produit.

## Configuration Cypress

- **baseUrl** : `http://localhost:4500` (back Next.js en dev).
- **Specs** : `cypress/e2e/**/*.cy.{js,jsx,ts,tsx}`.
- **Workflow CI** : `.github/workflows/cypress.yml` – attend que le back soit prêt sur le port 4500 avant de lancer Cypress.

## Ordre de lecture recommandé

| Fichier | Contenu |
|---------|---------|
| **[EPTC-01-back-sante.md](EPTC-01-back-sante.md)** | Santé back (B01, B02) : disponibilité, métriques. |
| **[EPTC-02-front-accueil-auth.md](EPTC-02-front-accueil-auth.md)** | Accueil et auth (F01–F05) : landing, login, sign-up, onboarding. |
| **[EPTC-03-front-dashboard-workshops.md](EPTC-03-front-dashboard-workshops.md)** | Dashboard et ateliers (F06–F08) : dashboard apprenant/mentor, catalogue, demande atelier. |
| **[EPTC-04-front-pages-secondaires.md](EPTC-04-front-pages-secondaires.md)** | Pages secondaires (F09–F10) : profil mentor, support, crédits, inbox. |
| **[EPTC-05-priorisation-pratiques.md](EPTC-05-priorisation-pratiques.md)** | Priorisation, bonnes pratiques Cypress, maintenance. |

## Usage pour Gemini

- Pour **écrire des specs E2E** sur une zone : charger ce README + le fichier EPTC correspondant + éventuellement PRD-01 (périmètre).
- Pour **réviser tout le plan E2E** : charger tous les EPTC dans l’ordre.
