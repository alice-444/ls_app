# Fonctionnalités LearnSup

Documentation des fonctionnalités produit — vue fonctionnelle par rôle et par domaine.

---

## Vue d'ensemble

LearnSup est une plateforme d'accompagnement mettant en relation **mentors** et **apprenants** via des ateliers, une messagerie temps réel et un hub communauté.

**Rôles** : MENTOR, APPRENANT, ADMIN.

---

## Par rôle

### Tous les utilisateurs (connectés)


| Fonctionnalité     | Description                                                                 | Pages / accès                                    |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------ |
| **Dashboard**      | Tableau de bord personnalisé selon le rôle                                  | `/dashboard`                                     |
| **Hub Communauté** | Events Hub, bons plans, Spot Finder, sondages, annuaire                     | `/community`                                     |
| **Messagerie**     | Conversations, envoi de messages, réactions, épinglages, temps réel         | `/inbox`, `/inbox/[conversationId]`              |
| **Réseau**         | Connexions mentor-apprenant, demandes, acceptation/rejet                    | `/network`                                       |
| **Notifications**  | Notifications in-app                                                        | `/notifications`                                 |
| **Support**        | Formulaire de demande, pièces jointes, conversation threadée avec admin     | `/support-request`                               |
| **Paramètres**     | Profil, mot de passe, email, blocages, notifications, suppression de compte | `/settings`                                      |
| **Aide**           | FAQ, informations légales                                                   | `/help`, `/info`, `/legal`, `/terms`, `/privacy` |


---

### Apprenant (APPRENANT)


| Fonctionnalité              | Description                                                                                   | Pages / accès                                 |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Catalogue mentors**       | Liste des mentors publiés, filtres, recherche                                                 | `/mentors`                                    |
| **Profil mentor**           | Vue détaillée d'un mentor : bio, ateliers, feedbacks, demande de connexion, demande d'atelier | `/mentors/[mentorId]`                         |
| **Demande de connexion**    | Envoyer une demande pour rejoindre le réseau d'un mentor                                      | Depuis profil mentor                          |
| **Demande d'atelier**       | Demander un atelier à un mentor connecté (débit 10 crédits)                                   | Depuis profil mentor ou catalogue             |
| **Prochains ateliers**      | Ateliers à venir, rejoindre la visio                                                          | `/workshop/[id]`, `/workshop/[id]/join-video` |
| **Feedback**                | Noter et commenter un atelier après participation                                             | Après atelier                                 |
| **Crédits**                 | Acheter des crédits (Polar), consulter le solde                                               | `/buy-credits`, `/paliers`                    |
| **Profil apprenant**        | Photo, tags ice-breaker, informations                                                         | `/profil`                                     |
| **Propositions communauté** | Proposer un deal, un événement, un spot (modération admin)                                    | `/community` (formulaires)                    |


---

### Mentor (MENTOR)


| Fonctionnalité          | Description                                                                          | Pages / accès                       |
| ----------------------- | ------------------------------------------------------------------------------------ | ----------------------------------- |
| **Profil mentor**       | Bio, photo, domaines, sujets, qualifications, réseaux sociaux, publication           | `/mentor-profile`                   |
| **Publication profil**  | Publier ou dépublier le profil (visible dans le catalogue)                           | `/mentor-profile`                   |
| **Création atelier**    | Créer un atelier (brouillon), définir titre, description, crédits, date, lieu, visio | `/workshop-editor`                  |
| **Publication atelier** | Publier un atelier pour le rendre visible                                            | `/my-workshops`                     |
| **Mes ateliers**        | Liste des ateliers, calendrier, filtres, prochain atelier                            | `/my-workshops`                     |
| **Demandes reçues**     | Voir et accepter/rejeter les demandes d'atelier des apprenants                       | Depuis mes ateliers / notifications |
| **Acceptation demande** | Accepter une demande : définir date, heure, lieu, créer la salle visio               | Depuis demande                      |
| **Visio**               | Rejoindre la salle Daily.co pour l'atelier                                           | `/workshop/[id]/join-video`         |
| **Feedbacks reçus**     | Consulter les feedbacks des apprenants                                               | Profil mentor                       |


---

### Admin (ADMIN)


| Fonctionnalité             | Description                                                                                  | Pages / accès                |
| -------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- |
| **Dashboard admin**        | Vue d'ensemble, statistiques                                                                 | `/admin`                     |
| **Utilisateurs**           | Liste, recherche, filtres, actions en masse (approbation, rejet)                             | `/admin/users`               |
| **Fiche 360°**             | Historique complet d'un utilisateur : ateliers, crédits, connexions, messages, support, etc. | `/admin/users/[id]`          |
| **Onboarding**             | File d'attente des comptes en attente de validation                                          | `/admin/onboarding`          |
| **Signalements**           | Modération des signalements utilisateurs                                                     | `/admin/user-reports`        |
| **Modération feedbacks**   | Approuver, rejeter, supprimer les feedbacks signalés                                         | `/admin/feedback-moderation` |
| **Support**                | Conversations threadées avec les utilisateurs                                                | `/admin/support`             |
| **Communauté**             | Modération des propositions (deals, events, spots), création directe                         | `/admin/community`           |
| **Notifications groupées** | Moteur de segmentation, envoi de notifications ciblées                                       | `/admin/notifications/bulk`  |
| **Audit logs**             | Traçabilité des actions admin                                                                | `/admin/audit-logs`          |
| **Paramètres admin**       | Configuration                                                                                | `/admin/settings`            |


---

## Par domaine fonctionnel

### Authentification

- **Inscription** : email, mot de passe, email de bienvenue avec lien onboarding
- **Connexion** : email/mot de passe ou magic link (lien envoyé par email)
- **Récupération mot de passe** : lien par email vers `/reset-password`
- **Onboarding** : choix du rôle (MENTOR ou APPRENANT), formulaire complémentaire
- **Session** : cookie, redirection selon rôle (ADMIN → `/admin`, autres → `/dashboard`)

### Ateliers (workshops)

- **Cycle** : Création (DRAFT) → Publication (PUBLISHED) → Demande apprenant (débit crédits) → Acceptation/rejet mentor → Visio Daily.co → Feedback apprenant → Cashback apprenant
- **Visio** : Salle Daily.co créée à la demande, token généré pour mentor et apprenant
- **Cashback** : Crédit automatique de l'apprenant après participation (cron)

### Crédits et paiement

- **Achat** : Redirection vers Polar, webhook confirme le paiement, crédit du compte
- **Utilisation** : Débit de 10 crédits lors d'une demande d'atelier
- **Historique** : Transactions (TOP_UP, USAGE, REFUND)

### Messagerie

- **Conversations** : Création à la demande, messages, réactions (emoji), épinglages
- **Temps réel** : Socket.IO — envoi/réception instantanée, typing indicators
- **Contraintes** : Messagerie possible uniquement entre utilisateurs connectés (réseau)

### Réseau (connexions)

- **Demande** : Apprenant envoie une demande à un mentor
- **Acceptation/rejet** : Mentor accepte ou rejette
- **Effet** : Si accepté → messagerie et demandes d'atelier débloquées entre les deux

### Hub Communauté

- **Events Hub** : Événements communautaires
- **Bons plans** : Deals étudiants (student_deal)
- **Spot Finder** : Lieux recommandés (community_spot)
- **Sondage** : Sondage hebdomadaire (community_poll), votes
- **Annuaire** : Liste des membres
- **Propositions** : Utilisateurs proposent deals/events/spots → modération admin
- **Création directe** : Admin peut créer deals, events, spots sans modération

### Support

- **Demande** : Formulaire avec sujet, description, type de problème, pièces jointes
- **Thread** : Conversation directe avec l'admin, notifications
- **Admin** : Réponse dans le thread, suivi des demandes

### Modération et sécurité

- **Blocage** : Bloquer un utilisateur (plus de messagerie, visibilité)
- **Signalement** : Signaler un utilisateur ou un feedback
- **Admin** : Revue des signalements, actions (approbation, rejet, sanctions)

### Suppression de compte

- **Demande** : L'utilisateur demande la suppression (raison optionnelle)
- **Effet immédiat** : Compte désactivé, sessions révoquées
- **Rétention** : Données conservées 30 jours (deletion_job)
- **Purge** : Cron anonymise les données personnelles à échéance

---

## Références techniques

- [Architecture](architecture.md) — Flux et schémas
- [Front](front.md) — Routes et composants
- [Back](back.md) — API et routers
- [Référence](reference.md) — Détails par domaine

