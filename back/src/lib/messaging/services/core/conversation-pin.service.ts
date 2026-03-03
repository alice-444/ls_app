import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IConversationRepository } from "../../repositories/conversation.repository.interface";

export interface IConversationPinService {
  pinConversation(
    appUserId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>>;

  unpinConversation(
    appUserId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>>;

  isConversationPinned(
    appUserId: string,
    conversationId: string
  ): Promise<boolean>;
}

/**
 * Stub implementation: conversation_pin model was removed from schema.
 * Pin/unpin operations succeed but do not persist; isConversationPinned always returns false.
 */
export class ConversationPinService implements IConversationPinService {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async pinConversation(
    appUserId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) return failure("Conversation not found", 404);

      if (
        conversation.participant1Id !== appUserId &&
        conversation.participant2Id !== appUserId
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("pinConversation", {
          resourceId: conversationId,
        })
      );
    }
  }

  async unpinConversation(
    appUserId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) return failure("Conversation not found", 404);

      if (
        conversation.participant1Id !== appUserId &&
        conversation.participant2Id !== appUserId
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("unpinConversation", {
          resourceId: conversationId,
        })
      );
    }
  }

  async isConversationPinned(
    _appUserId: string,
    _conversationId: string
  ): Promise<boolean> {
    return false;
  }
}
