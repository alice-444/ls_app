# EPTC – Back : santé et disponibilité

## B01 – Back disponible

**Objectif** : vérifier que le back répond sur l’URL de base.

**Critères d’acceptation :**
- Une requête GET sur `baseUrl` (ex. `http://localhost:4500`) retourne un statut 2xx ou une page HTML (pas 5xx ni timeout).
- Utilisable comme **smoke test** en CI.

**Exemple de spec (Cypress) :**
- `cy.visit('/')` ou `cy.request({ url: '/', failOnStatusCode: false })` puis assertion sur le statut ou le body.

**Référence** : `cypress/e2e/smoke.cy.ts` (à aligner sur le back si le back sert une page à `/`).

---

## B02 – Endpoint métriques (Prometheus)

**Objectif** : vérifier que l’endpoint de métriques est accessible (optionnel en E2E, utile pour monitoring).

**Critères d’acceptation :**
- GET `/api/metrics` retourne 200 et un contenu texte type Prometheus (ex. présence de `# HELP` ou `# TYPE`).
- Peut être protégé par un secret ou un header ; dans ce cas, le test E2E peut être désactivé ou utiliser une variable d’environnement.

**Exemple de spec :**
- `cy.request({ url: '/api/metrics' }).then((res) => { expect(res.status).to.eq(200); expect(res.body).to.be.a('string'); })`.

---

## Suite EPTC

- Accueil et auth : [EPTC-02-front-accueil-auth.md](EPTC-02-front-accueil-auth.md)
- Dashboard et ateliers : [EPTC-03-front-dashboard-workshops.md](EPTC-03-front-dashboard-workshops.md)
- Priorisation et pratiques : [EPTC-05-priorisation-pratiques.md](EPTC-05-priorisation-pratiques.md)
