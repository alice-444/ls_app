# EPTC – Priorisation et bonnes pratiques

## Priorisation des scénarios E2E

| Priorité | Scénarios | Commentaire |
|----------|-----------|-------------|
| **P0**   | B01, F01, F02, F04, F05 | Smoke back, landing, login, sign-up, onboarding – blocage si cassés. |
| **P1**   | F03, F06, F07, F08     | Login échec, dashboards, catalogue et demande – cœur métier. |
| **P2**   | B02, F09, F10           | Métriques, profil mentor, support/crédits/inbox – renforcement. |

Implémentation recommandée : couvrir P0 en premier, puis P1, puis P2.

---

## Bonnes pratiques Cypress (contexte LearnSup)

- **baseUrl** : pointer vers le back (4500) si les specs ciblent le back ; si les specs ciblent le front (3001), configurer baseUrl ou `cy.visit('http://localhost:3001/...')` et s’assurer que le front appelle le bon back.
- **Auth** : réutiliser un login (custom command `cy.login()` ou `beforeEach`) pour éviter de refaire sign-up à chaque test ; utiliser des comptes seed ou des fixtures.
- **Données** : ateliers, mentors publiés, etc. – préférer un seed ou des appels API en `before` pour mettre en place l’état, plutôt que de tout faire via l’UI.
- **Sélecteurs** : privilégier `data-cy` ou `data-testid` pour limiter la fragilité aux changements de style.
- **Flaky** : éviter les `cy.wait(ms)` fixes ; utiliser `cy.intercept()` pour attendre des requêtes réseau si besoin, et assertions sur le DOM.
- **CI** : un job dédié (ex. `cypress.yml`) qui lance le back (et si besoin le front), attend le port 4500 (et 3001 si nécessaire), puis lance Cypress.

---

## Maintenance

- Garder les EPTC alignés avec le PRD (PRD-01) et les parcours réels (routes, rôles).
- Lors de l’ajout d’une nouvelle feature, ajouter ou mettre à jour le fichier EPTC concerné et, si besoin, un scénario dans la priorisation ci-dessus.
- Documents associés : [PRD/README.md](../PRD/README.md), [gemini/00-index-documents.md](../gemini/00-index-documents.md).
