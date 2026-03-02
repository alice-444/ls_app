# EPTC – Front : accueil et authentification

Scénarios E2E pour la landing, le login, l’inscription et l’onboarding.

**Prérequis** : front sur 3001, back sur 4500 ; `NEXT_PUBLIC_SERVER_URL` pointant vers le back. Cypress cible le back (baseUrl 4500) ; pour des parcours complets front, utiliser l’URL du front ou un proxy selon la config projet.

---

## F01 – Page d’accueil / landing

**Objectif** : la page d’accueil s’affiche sans erreur.

**Critères d’acceptation :**
- Chargement de la page (front ou back selon ce qui sert `/`).
- Présence d’éléments attendus : lien « Connexion », lien « Inscription » ou CTA équivalent.
- Pas d’erreur console bloquante (à documenter ; les assertions Cypress sur la console sont optionnelles).

**Données** : aucune (page publique).

---

## F02 – Connexion (login) – succès

**Objectif** : un utilisateur existant peut se connecter et est redirigé vers le dashboard ou la page post-login.

**Critères d’acceptation :**
- Saisie email + mot de passe valides.
- Soumission du formulaire.
- Redirection vers `/dashboard` ou `/onboarding` (si rôle non choisi).
- Session active (ex. présence d’un élément utilisateur ou absence du lien « Connexion »).

**Données** : compte de test avec email/mot de passe connus (fixture ou seed).

**Pages/composants** : `front/src/app/login/page.tsx`, `front/src/components/sign-in-form.tsx` ; back `/api/auth/*`, `/api/sign-in`.

---

## F03 – Connexion – échec (identifiants invalides)

**Objectif** : affichage d’un message d’erreur en cas d’email ou mot de passe incorrect.

**Critères d’acceptation :**
- Saisie email/mot de passe invalides.
- Soumission du formulaire.
- Message d’erreur visible (sans redirection vers dashboard).
- Pas de fuite d’information (ex. « utilisateur inconnu » vs « mot de passe incorrect » à définir côté produit).

---

## F04 – Inscription (sign-up) – succès

**Objectif** : un nouvel utilisateur peut s’inscrire et est redirigé vers l’onboarding ou le dashboard.

**Critères d’acceptation :**
- Saisie nom, email, username, mot de passe (selon le formulaire).
- Soumission du formulaire.
- Redirection vers `/onboarding` (choix de rôle) ou `/dashboard`.
- Compte créé (vérifiable par un login ultérieur ou par un appel API si exposé en test).

**Données** : email/username uniques (générés dans le test ou fixture).

**Pages/composants** : `front/src/components/sign-up-form.tsx` ; back `/api/sign-up`.

---

## F05 – Onboarding – choix de rôle

**Objectif** : après inscription (ou premier login sans rôle), l’utilisateur choisit MENTOR ou APPRENANT et est redirigé correctement.

**Critères d’acceptation :**
- Arrivée sur la page d’onboarding (ex. `/onboarding`).
- Sélection du rôle (MENTOR ou APPRENANT).
- Soumission.
- Redirection vers dashboard ou page de profil mentor (selon rôle).
- Rôle persisté (prochain login sans re-onboarding).

**Back** : `/api/onboarding/select-role`.

---

## Suite EPTC

- Dashboard et ateliers : [EPTC-03-front-dashboard-workshops.md](EPTC-03-front-dashboard-workshops.md)
- Pages secondaires : [EPTC-04-front-pages-secondaires.md](EPTC-04-front-pages-secondaires.md)
- Priorisation et pratiques : [EPTC-05-priorisation-pratiques.md](EPTC-05-priorisation-pratiques.md)
