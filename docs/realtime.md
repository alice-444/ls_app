# Temps Réel & Socket.IO — LearnSup

Ce document détaille l'architecture temps réel de LearnSup basée sur Socket.IO, incluant la gestion des sessions, le catalogue des événements et la résilience du système.

---

## 🏗️ Architecture

Le système temps réel est intégré directement au serveur backend Next.js via un serveur Socket.IO personnalisé monté sur le même serveur HTTP.

### Client (Frontend)
- **Hook `useSocket`** : Initialise la connexion Socket.IO au montage de l'application si une session utilisateur existe (y compris en interface admin : même client, room `admins` côté serveur si rôle ADMIN).
- **Hook `useChatSocket`** : Gère la logique spécifique à une conversation (join/leave room, écoute des messages et indicateurs de frappe).
- **Transport** : Tente `websocket` en priorité, avec repli sur `polling`.

### Serveur (Backend)
- **Middleware d'Authentification** : Chaque tentative de connexion WebSocket est validée via Better Auth (lecture des cookies de session). Si la session est invalide ou expirée, la connexion est refusée.
- **Gestion des Handlers** : La logique métier est découpée en handlers spécialisés (ex: `SocketMessageHandler`).
- **DI Integration** : Les handlers socket utilisent le conteneur de dépendances (`container.ts`) pour accéder aux services métier (MessagingService, NotificationService).

---

## 🏠 Système de Rooms

Le serveur utilise des "Rooms" pour segmenter la diffusion des événements et garantir la confidentialité :

| Room | Format | Usage |
|------|--------|-------|
| **Utilisateur** | `user:{userId}` | Événements privés : nouvelles notifications, mises à jour globales des conversations. |
| **Admins** | `admins` | Rejoint automatiquement si le rôle en base est `ADMIN` (après auth socket). Diffusion des alertes métier réservées à l’équipe admin. |
| **Conversation** | `conversation:{conversationId}` | Événements de discussion : nouveaux messages, indicateurs de frappe, réactions. |

---

## 📚 Catalogue des Événements

### 💬 Messagerie

#### Client ➡️ Serveur
| Événement | Données | Description |
|-----------|---------|-------------|
| `join-conversation` | `conversationId` | Rejoint la room d'une discussion spécifique. |
| `leave-conversation` | `conversationId` | Quitte la room d'une discussion. |
| `typing-start` | `{ conversationId }` | Déclenche l'indicateur "en train d'écrire" pour les autres. |
| `typing-stop` | `{ conversationId }` | Arrête l'indicateur de frappe. |
| `mark-messages-read` | `{ conversationId, messageIds }` | Notifie que des messages ont été lus. |

#### Serveur ➡️ Client
| Événement | Données | Description |
|-----------|---------|-------------|
| `new-message` | `ChatMessage` | Réception d'un nouveau message dans la room. |
| `message-updated` | `{ messageId, content, ... }` | Notification de modification d'un message. |
| `message-deleted` | `{ messageId, conversationId }` | Notification de suppression d'un message. |
| `user-typing` | `{ userId, conversationId }` | Affiche l'indicateur de frappe d'un participant. |
| `user-stopped-typing` | `{ userId, conversationId }` | Masque l'indicateur de frappe. |
| `messages-read` | `{ conversationId, messageIds }` | Met à jour le statut de lecture côté client. |
| `reaction-added` | `{ messageId, userId, emoji }` | Ajout d'une réaction. |
| `reaction-removed` | `{ messageId, userId, emoji }` | Retrait d'une réaction. |
| `conversation-updated` | `ChatConversation` | Met à jour la liste des conversations (dernier message, non-lus). |

### 🔔 Notifications

#### Serveur ➡️ Client
| Événement | Données | Description |
|-----------|---------|-------------|
| `new-notification` | `NotificationEntity` | Envoi d'une nouvelle notification in-app. |
| `notification-updated` | — | Signal qu'un changement a eu lieu dans les notifications (ex: compteur mis à jour). |

#### Alertes admin (room `admins`)

Émis par le serveur lors d’événements métier (ex. via `NotificationService.notifyAdmin` → `SocketNotificationEventEmitter.emitAdminNotification`). Le front admin écoute dans `AdminNotificationListener` (layout admin) et affiche des toasts (Sonner).

| Événement | Données | Description |
|-----------|---------|-------------|
| `admin:new-notification` | `{ type, message, details?, createdAt }` | Alerte temps réel pour les admins connectés. `type` typique : `NEW_REPORT`, `NEW_FEEDBACK_MODERATION`, `NEW_SUPPORT_REQUEST`. `details` peut contenir `actionUrl` pour un lien « Voir ». |

### 🟢 Présence

#### Serveur ➡️ Client (Broadcast)
| Événement | Données | Description |
|-----------|---------|-------------|
| `user-online` | `{ userId }` | Signal qu'un utilisateur vient de se connecter. |
| `user-offline` | `{ userId }` | Signal qu'un utilisateur s'est déconnecté. |

---

## 🔄 Résilience & Reconnexion

La stratégie de reconnexion est configurée côté client pour maximiser la disponibilité :

1.  **Tentatives automatiques** : 20 tentatives de reconnexion en cas de coupure.
2.  **Délai exponentiel** : Entre 1s et 5s entre chaque tentative pour éviter de saturer le serveur.
3.  **Repli sur Polling** : Si le protocole WebSocket est bloqué (pare-feu, proxy), le client bascule automatiquement en HTTP Long Polling.
4.  **État UI** : Le hook `useSocket` renvoie `null` quand le socket est déconnecté, permettant à l'UI d'afficher des états de repli (ex: masquer les indicateurs de présence).

---

## 🔒 Sécurité

- **Vérification de Session** : Impossible de se connecter au WebSocket sans un cookie de session valide.
- **Isolation des Rooms** : Un utilisateur ne peut rejoindre la room `conversation:{id}` que s'il est officiellement participant de cette conversation en base de données.
- **CORS** : Seules les origines définies dans `CORS_ORIGIN` sont autorisées à établir une connexion.
