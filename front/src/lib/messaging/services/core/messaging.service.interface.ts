import type { Result } from "../../../common";
import { ConversationListItem } from "@ls-app/shared";

export interface MessageItem {
  messageId: string;
  senderId: string;
  senderName: string | null;
  senderDisplayName: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date | null;
  editCount: number;
  isRead: boolean;
  replyToMessageId: string | null;
  replyToMessage?: {
    messageId: string;
    content: string;
    senderName: string | null;
    senderDisplayName: string | null;
  } | null;
  workshopReference?: {
    workshopTitle: string;
    workshopDate: Date | null;
  } | null;
}

export interface IMessagingService {
  getConversations(userId: string): Promise<Result<ConversationListItem[]>>;

  getOrCreateConversation(
    userId1: string,
    userId2: string,
    workshopId?: string | null,
  ): Promise<Result<{ conversationId: string }>>;

  sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    replyToMessageId?: string | null,
  ): Promise<Result<{ messageId: string }>>;

  searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    limit?: number,
  ): Promise<Result<MessageItem[]>>;

  getMessages(
    userId: string,
    conversationId: string,
    limit?: number,
    offset?: number,
  ): Promise<Result<MessageItem[]>>;

  markMessagesAsRead(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean; messageIds: string[] }>>;

  getConversationDetails(
    userId: string,
    conversationId: string,
  ): Promise<
    Result<{
      workshopId: string | null;
      workshopTitle: string | null;
      workshopDate: Date | null;
    }>
  >;

  getUnreadConversationsCount(
    userId: string,
  ): Promise<Result<{ count: number }>>;

  deleteConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>>;

  updateMessage(
    userId: string,
    messageId: string,
    content: string,
  ): Promise<Result<{ messageId: string; conversationId: string }>>;

  deleteMessage(
    userId: string,
    messageId: string,
  ): Promise<Result<{ success: boolean; conversationId: string }>>;

  pinConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>>;

  unpinConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>>;
}
