# EPTC – Front : dashboard et ateliers

Scénarios E2E pour le tableau de bord (apprenant/mentor) et le parcours ateliers (catalogue, demande).

**Prérequis** : utilisateur connecté (session). Cypress : seeder ou login dans un `beforeEach` pour avoir un compte apprenant et un compte mentor selon les cas.

---

## F06 – Dashboard apprenant

**Objectif** : un apprenant voit ses demandes, ateliers confirmés et informations de compte.

**Critères d’acceptation :**
- Connexion en tant qu’apprenant.
- Accès à `/dashboard`.
- Affichage des blocs attendus : demandes en attente, ateliers à venir / passés, solde de crédits (si affiché).
- Liens ou boutons fonctionnels : annuler une demande, accéder à un atelier, etc. (selon maquettes).

**Composants** : `front/src/...` (ApprenantDashboard ou équivalent) ; données tRPC / API.

---

## F07 – Dashboard mentor

**Objectif** : un mentor voit les demandes reçues, ses ateliers et les actions de gestion.

**Critères d’acceptation :**
- Connexion en tant que mentor.
- Accès à `/dashboard`.
- Affichage : demandes reçues, ateliers à venir, statistiques (optionnel).
- Actions : accepter/refuser une demande, accéder à l’édition d’un atelier (selon périmètre).

---

## F08 – Catalogue ateliers et demande de participation

**Objectif** : un apprenant peut consulter le catalogue, filtrer (optionnel) et demander à participer à un atelier.

**Critères d’acceptation :**
- Connexion en tant qu’apprenant.
- Accès à la page catalogue (ex. `/workshop-room` ou `/ateliers`).
- Liste d’ateliers publiés visible.
- Clic sur « Demander à participer » (ou équivalent) pour un atelier.
- Confirmation visuelle (toast, message) et apparition dans « Mes demandes » ou équivalent sur le dashboard.
- Côté mentor : la demande apparaît dans « Demandes reçues » (peut être un second scénario ou le même flux en deux comptes).

**Données** : au moins un atelier publié (seed ou création via API/back).

**Pages** : `front/src/app/workshop-room/...` ; tRPC `mentor.getPublicWorkshops`, procédures de demande.

---

## Suite EPTC

- Pages secondaires : [EPTC-04-front-pages-secondaires.md](EPTC-04-front-pages-secondaires.md)
- Priorisation et pratiques : [EPTC-05-priorisation-pratiques.md](EPTC-05-priorisation-pratiques.md)
