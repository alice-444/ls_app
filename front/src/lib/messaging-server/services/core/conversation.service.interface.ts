import type { Result } from "../../../common";
import type { ConversationListItem } from "@ls-app/shared";

export interface IConversationService {
  getConversations(userId: string): Promise<Result<ConversationListItem[]>>;

  getOrCreateConversation(
    userId1: string,
    userId2: string,
    workshopId?: string | null,
  ): Promise<Result<{ conversationId: string }>>;

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

  pinConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>>;

  unpinConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>>;
}
