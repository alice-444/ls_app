# Sécurité & Protection des Données

Ce document détaille les mesures de sécurité, le contrôle d'accès et la conformité RGPD mis en œuvre dans LearnSup.

---

## 🔐 Contrôle d'Accès (RBAC)

Le système utilise **tRPC** pour gérer les autorisations de manière granulaire via des middlewares.

### Hiérarchie des Procédures
- **`publicProcedure`** : Accès libre (ex: consultation du catalogue des mentors).
- **`protectedProcedure`** : Requiert une session active via Better Auth.
- **`mentorProcedure`** : Requiert une session active + rôle `MENTOR` + statut `ACTIVE`.
- **`adminProcedure`** : Requiert une session active + rôle `ADMIN` + statut `ACTIVE`.

### Audit Logging (Admin)
Toutes les actions de modification effectuées via une `adminProcedure` sont automatiquement enregistrées dans une table d'audit. Le middleware `adminLogger` capture :
- L'ID de l'administrateur.
- L'action effectuée (basée sur le chemin tRPC).
- Les données d'entrée (input) de la requête.

---

## 🛡️ Protection contre les Abus

### Rate Limiting (Brute Force & DoS)
Un limiteur de débit en mémoire (`InMemoryRateLimiter`) est utilisé pour protéger les points d'entrée sensibles :

| Contexte | Limite | Fenêtre |
| :--- | :--- | :--- |
| **Onboarding** | 10 requêtes | 1 minute |
| **Upload de fichiers** | 5 requêtes | 1 minute |
| **Profil utilisateur** | 20 requêtes | 1 minute |

### Sécurité de l'Authentification
- **Vérification d'Email** : Obligatoire pour activer le compte.
- **Verrouillage de compte** : Better Auth gère automatiquement l'échec des tentatives de connexion (failedLoginAttempts, lockoutTime).
- **Trusted Origins** : Les requêtes sont limitées aux origines définies dans `CORS_ORIGIN`.

---

## ⚖️ Conformité RGPD

### Gestion des Données Sensibles
- **Anonymisation** : Lors de la suppression d'un compte, les données personnelles (PII) sont remplacées par des valeurs anonymes au lieu d'être simplement supprimées, afin de préserver l'intégrité des statistiques et des historiques de transactions.
- **Délai de Rétention** : Un délai de 30 jours est appliqué avant la purge définitive via un `deletion_job`.

### Droit à l'Effacement
Le flux de suppression est le suivant :
1. L'utilisateur demande la suppression (DELETE `/api/profile/delete`).
2. Le compte est "Soft Deleted" (accès bloqué immédiatement).
3. Un job de suppression planifié est créé.
4. Après 30 jours, un script cron (`purge-deletions`) anonymise les données :
   - `name`, `email`, `displayName`, `bio` sont réinitialisés.
   - Les fichiers uploadés (photos) sont supprimés.

### Transparence
Toutes les données collectées sont visibles par l'utilisateur via son profil et ses paramètres. L'utilisateur peut demander un export de ses données (implémenté via les services de profil).

---

## 🛠️ Sécurité du Code

- **Validation des Entrées** : Utilisation systématique de **Zod** pour valider chaque input tRPC ou API, prévenant les injections et les données malformées.
- **Type Safety** : TypeScript assure que les données manipulées correspondent aux contrats définis, réduisant les erreurs logiques de sécurité.
- **ORM Sécurisé** : Prisma prévient par défaut les injections SQL via l'utilisation de requêtes paramétrées.
