import type { Result } from "../../../common";
import type { MessageItem } from "./messaging.service.interface";

export interface IMessageOperationsService {
  sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    replyToMessageId?: string | null
  ): Promise<Result<{ messageId: string }>>;

  getMessages(
    userId: string,
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<MessageItem[]>>;

  markMessagesAsRead(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean; messageIds: string[] }>>;

  updateMessage(
    userId: string,
    messageId: string,
    content: string
  ): Promise<Result<{ messageId: string; conversationId: string }>>;

  searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    limit?: number
  ): Promise<Result<MessageItem[]>>;

  deleteMessage(
    userId: string,
    messageId: string
  ): Promise<Result<{ success: boolean; conversationId: string }>>;
}
