/**
 * @file messaging.ts
 * Centralized types for Messaging entities.
 */

export interface ConversationListItem {
  conversationId: string;
  otherUserId: string;
  otherUserName: string | null;
  otherUserDisplayName: string | null;
  otherUserPhotoUrl: string | null;
  otherUserRole: "MENTOR" | "APPRENANT" | "ADMIN" | null;
  lastMessage: {
    content: string;
    createdAt: Date | string;
  } | null;
  unreadCount: number;
  updatedAt: Date | string;
  workshopId: string | null;
  workshopTitle: string | null;
  workshopDate: Date | string | null;
  isPinned: boolean;
}
