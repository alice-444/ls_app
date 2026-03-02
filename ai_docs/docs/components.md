# LearnSup – Composants frontend clés

Liste des composants principaux pour l’IA. Tous sous `front/src/components/` sauf mention. Pages sous `front/src/app/`.

---

## Auth

| Composant | Fichier | Rôle |
|-----------|---------|------|
| SignInForm | `sign-in-form.tsx` | Formulaire connexion (email, mot de passe), Tanstack Form + zod, authClient.signIn.email, redirect dashboard |
| SignUpForm | `sign-up-form.tsx` | Formulaire inscription (nom, email, username, mot de passe), appel API sign-up, redirect onboarding/dashboard |
| Loader | `loader.tsx` | Indicateur de chargement global |

Pages : `app/login/page.tsx`, `app/onboarding/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/verify-email-change/page.tsx`.

---

## Dashboard

| Composant | Fichier | Rôle |
|-----------|---------|------|
| ApprenantDashboard | `dashboard/ApprenantDashboard.tsx` | Vue apprenant : demandes, ateliers à venir, sidebar |
| MentorDashboard | `dashboard/MentorDashboard.tsx` | Vue mentor : demandes reçues, ateliers, actions |
| ApprenantDashboardSidebar | `dashboard/ApprenantDashboardSidebar.tsx` | Navigation / résumé côté apprenant |
| StatCard | `dashboard/StatCard.tsx` | Carte statistique |
| StatusBadge | `dashboard/StatusBadge.tsx` | Badge de statut (demande, atelier) |
| RequestBadges | `dashboard/RequestBadges.tsx` | Badges des demandes |
| AllWorkshopRequestsDialog | `dashboard/AllWorkshopRequestsDialog.tsx` | Dialog liste des demandes (mentor) |
| FloatingAddButton | `dashboard/FloatingAddButton.tsx` | Bouton flottant action (ex. créer atelier) |

Page : `app/dashboard/page.tsx` (affiche ApprenantDashboard ou MentorDashboard selon rôle).

---

## Ateliers (workshops)

| Composant | Fichier | Rôle |
|-----------|---------|------|
| WorkshopCard | `workshop/cards/WorkshopCard.tsx` | Carte atelier (liste / grille) |
| WorkshopDetails | `workshop/WorkshopDetails.tsx` | Détail d’un atelier |
| WorkshopHeader | `workshop/cards/WorkshopHeader.tsx` | En-tête atelier |
| WorkshopDescription | `workshop/cards/WorkshopDescription.tsx` | Description |
| WorkshopDetailsCard | `workshop/cards/WorkshopDetailsCard.tsx` | Carte détail |
| WorkshopCreatorCard | `workshop/cards/WorkshopCreatorCard.tsx` | Carte créateur/mentor |
| WorkshopParticipantsCard | `workshop/cards/WorkshopParticipantsCard.tsx` | Participants |
| WorkshopActionsCard | `workshop/cards/WorkshopActionsCard.tsx` | Actions (rejoindre, annuler, etc.) |
| WorkshopRequests | `workshop/requests/WorkshopRequests.tsx` | Liste des demandes |
| WorkshopRequestCard | `workshop/requests/WorkshopRequestCard.tsx` | Carte une demande |
| WorkshopFilters | `workshop/filters/WorkshopFilters.tsx` | Filtres catalogue |
| WorkshopCalendar | `workshop/calendar/WorkshopCalendar.tsx` | Calendrier |
| DailyVideoCall | `workshop/DailyVideoCall.tsx` | Intégration visio Daily |
| JoinVideoButton | `workshop/JoinVideoButton.tsx` | Bouton rejoindre la visio |
| SubmitFeedbackDialog | `workshop/SubmitFeedbackDialog.tsx` | Dialog feedback après atelier |
| WorkshopReviews | `workshop/WorkshopReviews.tsx` | Avis / feedbacks affichés |
| TippingModal | `workshop/TippingModal.tsx` | Pourboire mentor |
| CreateWorkshopForm / EditWorkshopForm | `workshop-editor/` | Création / édition atelier |

Pages : `app/workshop-room/page.tsx`, `app/workshop/[id]/page.tsx`, `app/workshop/[id]/join-video/page.tsx`, `app/workshop-editor/page.tsx`, `app/my-workshops/page.tsx`.

---

## Mentor / Apprenant

| Composant | Fichier | Rôle |
|-----------|---------|------|
| MentorProfileModal | `mentor/MentorProfileModal.tsx` | Modal profil mentor |
| MentorFeedbacks | `mentor/MentorFeedbacks.tsx` | Feedbacks reçus par le mentor |
| MentorWorkshopHistory | `mentor/MentorWorkshopHistory.tsx` | Historique ateliers mentor |
| AcceptWorkshopRequestDialog | `mentor/AcceptWorkshopRequestDialog.tsx` | Accepter une demande |
| RejectWorkshopRequestDialog | `mentor/RejectWorkshopRequestDialog.tsx` | Refuser une demande |
| RequestWorkshopParticipationDialog | `mentor/RequestWorkshopParticipationDialog.tsx` | Demander à participer |
| ContactMentorDialog | `mentor/ContactMentorDialog.tsx` | Contacter le mentor |
| ApprenticeSidebar | `apprentice/ApprenticeSidebar.tsx` | Sidebar apprenant |
| ApprenticeWorkshopDashboard | `apprentice/ApprenticeWorkshopDashboard.tsx` | Dashboard ateliers apprenant |
| AvailableWorkshopsGrid | `apprentice/AvailableWorkshopsGrid.tsx` | Grille ateliers disponibles |
| UpcomingWorkshopsCard | `apprentice/UpcomingWorkshopsCard.tsx` | Prochains ateliers |
| MiniProfileModal | `apprentice/MiniProfileModal.tsx` | Mini profil (apprenant) |

Pages : `app/mentors/page.tsx`, `app/mentors/[id]/page.tsx`, `app/mentor-profile/page.tsx`, `app/apprentice/[userId]/page.tsx`.

---

## Profil & paramètres

| Composant | Fichier | Rôle |
|-----------|---------|------|
| ProfilePhotoUpload | `profil/ProfilePhotoUpload.tsx` | Upload photo de profil |
| ProfilePreviewCard | `profil/ProfilePreviewCard.tsx` | Aperçu profil |
| BasicInformationSection, TagListSection, SocialMediaSection, PublicationSection | `mentor-profile/*.tsx` | Sections formulaire profil mentor |
| PersonalInformationSection, UpdateProfileSection, AccountSection, ChangePasswordSection, ChangeEmailSection, NotificationsSection, BlockedUsersSection, DeleteAccountSection, HelpCenterSection, FeedbackSection, AboutSection, SystemSettingsSection | `settings/*.tsx` | Sections page paramètres |

Pages : `app/profil/page.tsx`, `app/my-profile/page.tsx`, `app/mentor-profile/page.tsx`, `app/settings/page.tsx`.

---

## Messagerie

| Composant | Fichier | Rôle |
|-----------|---------|------|
| ConversationList | `messaging/ConversationList.tsx` | Liste des conversations |
| ConversationRow / ConversationItem | `messaging/ConversationRow.tsx`, `ConversationItem.tsx` | Ligne / item conversation |
| ChatWindow | `messaging/ChatWindow.tsx` | Fenêtre de chat |
| ChatHeader | `messaging/ChatHeader.tsx` | En-tête chat |
| MessageList | `messaging/MessageList.tsx` | Liste des messages |
| MessageInput | `messaging/MessageInput.tsx` | Saisie et envoi message |
| MessageReactions | `messaging/MessageReactions.tsx` | Réactions |
| ReplyPreview | `messaging/ReplyPreview.tsx` | Aperçu réponse |
| NewConversationDialog | `messaging/NewConversationDialog.tsx` | Nouvelle conversation |
| DeleteConversationDialog | `messaging/DeleteConversationDialog.tsx` | Supprimer conversation |
| TypingIndicator | `messaging/TypingIndicator.tsx` | Indicateur de saisie |
| PresenceIndicator | `messaging/PresenceIndicator.tsx` | Présence utilisateur |

Pages : `app/inbox/page.tsx`, `app/inbox/[conversationId]/page.tsx`.

---

## Réseau & modération

| Composant | Fichier | Rôle |
|-----------|---------|------|
| PendingRequestsList, PendingRequestItem | `network/PendingRequestsList.tsx`, `PendingRequestItem.tsx` | Demandes de connexion |
| AcceptedConnectionsList, ConnectionItem | `network/AcceptedConnectionsList.tsx`, `ConnectionItem.tsx` | Connexions acceptées |
| RemoveConnectionDialog | `network/RemoveConnectionDialog.tsx` | Retirer une connexion |
| ProfileModalManager | `network/ProfileModalManager.tsx` | Gestion modals profil |
| BlockUserDialog | `user/BlockUserDialog.tsx` | Bloquer un utilisateur |
| ReportUserDialog | `user/ReportUserDialog.tsx` | Signaler un utilisateur |

Page : `app/network/page.tsx`.

---

## Layout & UI partagés

| Composant | Fichier | Rôle |
|-----------|---------|------|
| Header | `header.tsx` | En-tête site, nav, user menu |
| Footer | `footer.tsx` | Pied de page |
| Sidebar | `sidebar.tsx` | Barre latérale navigation |
| UserMenu | `user-menu.tsx` | Menu utilisateur (dropdown) |
| PageContainer | `layout/PageContainer.tsx` | Conteneur de page |
| PageHeader | `layout/PageHeader.tsx` | Titre de page |
| PageCard | `layout/PageCard.tsx` | Carte de section |
| SectionSidebar | `layout/SectionSidebar.tsx` | Sidebar de section |
| BackButton | `back-button.tsx` | Retour |
| NotificationBell | `notification-bell.tsx` | Cloche notifications |
| ThemeProvider, ModeToggle | `theme-provider.tsx`, `mode-toggle.tsx` | Thème / dark mode |
| Providers | `providers.tsx` | Providers React (tRPC, Query, etc.) |

Composants UI (shadcn-style) : `ui/button.tsx`, `ui/input.tsx`, `ui/label.tsx`, `ui/card.tsx`, `ui/dialog.tsx`, `ui/alert-dialog.tsx`, `ui/dropdown-menu.tsx`, `ui/select.tsx`, `ui/checkbox.tsx`, `ui/switch.tsx`, `ui/badge.tsx`, `ui/alert.tsx`, `ui/textarea.tsx`, `ui/skeleton.tsx`, `ui/popover.tsx`, `ui/separator.tsx`, `ui/sonner.tsx`.

---

## Autres pages

- `app/page.tsx` : accueil / landing  
- `app/workshops/page.tsx` : ateliers  
- `app/buy-credits/page.tsx`, `app/paliers/page.tsx` : crédits  
- `app/support-request/page.tsx` : formulaire support  
- `app/notifications/page.tsx` : liste notifications  
- `app/help/page.tsx`, `app/faq/` : aide  
- `app/admin/feedback-moderation/page.tsx` : modération feedbacks (admin)  
- `app/legal/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/info/page.tsx` : légal / infos
