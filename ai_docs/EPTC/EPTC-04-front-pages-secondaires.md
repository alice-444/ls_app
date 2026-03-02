# EPTC – Front : pages secondaires

Scénarios E2E pour les pages secondaires : profil mentor, support, crédits, messagerie.

**Prérequis** : utilisateur connecté quand l’accès est protégé.

---

## F09 – Profil mentor public

**Objectif** : la fiche publique d’un mentor s’affiche avec les informations publiées (photo, bio, ateliers).

**Critères d’acceptation :**
- Accès à `/mentors/[id]` (ou URL équivalente) avec un id de mentor ayant publié son profil.
- Affichage : photo, bio, ateliers à venir (ou lien vers catalogue).
- Pas d’informations privées (email, etc.).
- Lien ou bouton pour « Demander à participer » vers un atelier (selon design).

**Données** : un mentor avec profil publié et au moins un atelier (seed).

---

## F10 – Support, crédits, inbox (smoke)

**Objectif** : les pages secondaires se chargent sans erreur et affichent le contenu attendu (formulaire support, solde crédits, liste conversations).

**Critères d’acceptation :**
- **Support** : `/support-request` – formulaire visible ; soumission optionnelle en E2E (peut être un test séparé avec mock email).
- **Crédits** : `/buy-credits` ou `/paliers` – page accessible, pas de crash.
- **Inbox** : `/inbox` – liste des conversations (vide ou non) ; accès à une conversation `/inbox/[id]` si applicable.

Ces scénarios peuvent rester en « smoke » (chargement + présence d’un élément clé) et être détaillés plus tard.

---

## Suite EPTC

- Priorisation et bonnes pratiques : [EPTC-05-priorisation-pratiques.md](EPTC-05-priorisation-pratiques.md)
