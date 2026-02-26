import { Result, failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { generateInternalId } from "../../../utils/id-generator";
import type { AppUserRepository } from "../../../users/repositories";
import type {
  IConversationRepository,
  ConversationEntity,
} from "../../repositories/conversation.repository.interface";
import type { IMessageRepository } from "../../repositories/message.repository.interface";
import type { IMessageOperationsService } from "./message-operations.service.interface";
import type { MessageItem } from "./messaging.service.interface";
import { verifyUserExists } from "../../../auth/services/user-helpers";
import type { IMessageValidationService } from "../validation/message-validation.service.interface";
import type { IMessageEnrichmentService } from "../enrichment/message-enrichment.service.interface";
import type { IUserBlockService } from "../../../users/services/moderation/user-block.service.interface";
import { logger } from "../../../common/logger";

export class MessageOperationsService implements IMessageOperationsService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: IMessageValidationService,
    private readonly enrichmentService: IMessageEnrichmentService,
    private readonly userBlockService: IUserBlockService
  ) {}

  private async validateUserAndGetAppUser(userId: string): Promise<
    Result<{
      appUser: NonNullable<
        Awaited<ReturnType<AppUserRepository["findByUserId"]>>
      >;
    }>
  > {
    const userCheck = await verifyUserExists(userId);
    if (!userCheck.ok) return userCheck;

    const appUser = await this.appUserRepository.findByUserId(userId);
    if (!appUser) return failure("User not found", 404);

    return success({ appUser });
  }

  private async validateConversationAccess(
    userId: string,
    conversationId: string
  ): Promise<Result<{ appUser: any; conversation: ConversationEntity }>> {
    const userResult = await this.validateUserAndGetAppUser(userId);
    if (!userResult.ok) return userResult;

    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) return failure("Conversation not found", 404);

    if (
      conversation.participant1Id !== userResult.data.appUser.id &&
      conversation.participant2Id !== userResult.data.appUser.id
    ) {
      return failure("You are not a participant in this conversation", 403);
    }

    return success({ appUser: userResult.data.appUser, conversation });
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
    replyToMessageId?: string | null
  ): Promise<Result<{ messageId: string }>> {
    try {
      const accessResult = await this.validateConversationAccess(
        userId,
        conversationId
      );
      if (!accessResult.ok) return accessResult;

      const { appUser, conversation } = accessResult.data;

      const blockCheckResult = await this.checkBlockStatus(
        appUser,
        conversation,
        conversationId
      );
      if (blockCheckResult && !blockCheckResult.ok) return blockCheckResult;

      const contentValidation =
        this.validationService.validateMessageContent(content);
      if (!contentValidation.ok) return contentValidation;

      if (replyToMessageId) {
        const replyValidation = await this.validateReply(
          replyToMessageId,
          conversationId
        );
        if (replyValidation && !replyValidation.ok) return replyValidation;
      }

      const message = await this.messageRepository.create({
        id: generateInternalId(),
        conversationId,
        senderId: appUser.id,
        content: contentValidation.data,
        replyToMessageId: replyToMessageId || null,
      });

      await this.conversationRepository.update(conversation.id, {
        updatedAt: new Date(),
      });

      return success({ messageId: message.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("sendMessage", {
          userId,
          resourceId: conversationId,
          details: { replyToMessageId },
        })
      );
    }
  }

  private async checkBlockStatus(
    appUser: any,
    conversation: ConversationEntity,
    conversationId: string
  ): Promise<Result<never> | null> {
    const otherParticipantId =
      conversation.participant1Id === appUser.id
        ? conversation.participant2Id
        : conversation.participant1Id;

    const otherAppUser = await this.appUserRepository.findByAppUserId(
      otherParticipantId
    );

    if (!otherAppUser) return null;

    const blockResult = await this.userBlockService.areUsersBlocked(
      appUser.userId,
      otherAppUser.userId
    );

    if (!blockResult.ok) {
      logger.error("Error checking block status before sending message", {
        senderUserId: appUser.userId,
        recipientUserId: otherAppUser.userId,
        error: blockResult.error,
        conversationId,
      });
      return failure("Cannot verify if user is blocked", 500);
    }

    const { user1BlockedUser2, user2BlockedUser1 } = blockResult.data;
    if (user1BlockedUser2 || user2BlockedUser1) {
      logger.warn("Message blocked due to user block", {
        senderUserId: appUser.userId,
        recipientUserId: otherAppUser.userId,
        conversationId,
      });
      return failure("Cannot send message to this user", 403);
    }

    return null;
  }

  private async validateReply(
    replyToMessageId: string,
    conversationId: string
  ): Promise<Result<never> | null> {
    const replyToMessage = await this.messageRepository.findById(replyToMessageId);
    if (!replyToMessage) return failure("Message to reply to not found", 404);
    if (replyToMessage.conversationId !== conversationId) {
      return failure("Cannot reply to a message from another conversation", 400);
    }
    return null;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Result<MessageItem[]>> {
    try {
      const accessResult = await this.validateConversationAccess(
        userId,
        conversationId
      );
      if (!accessResult.ok) return accessResult;

      const messages = await this.messageRepository.findMessagesForConversation(
        conversationId,
        limit,
        offset
      );

      const messagesWithDetails = await Promise.all(
        messages.map((message) =>
          this.enrichmentService.enrichMessageEntity(message)
        )
      );

      return success(messagesWithDetails);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getMessages", {
          userId,
          resourceId: conversationId,
          details: { limit, offset },
        })
      );
    }
  }

  async markMessagesAsRead(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean; messageIds: string[] }>> {
    try {
      const accessResult = await this.validateConversationAccess(
        userId,
        conversationId
      );
      if (!accessResult.ok) return accessResult;

      const messageIds = await this.messageRepository.markMessagesAsRead(
        conversationId,
        accessResult.data.appUser.id
      );

      return success({ success: true, messageIds });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("markMessagesAsRead", {
          userId,
          resourceId: conversationId,
        })
      );
    }
  }

  async updateMessage(
    userId: string,
    messageId: string,
    content: string
  ): Promise<Result<{ messageId: string; conversationId: string }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;
      const message = await this.messageRepository.findById(messageId);
      if (!message) return failure("Message not found", 404);

      if (message.senderId !== appUser.id) {
        return failure("You can only edit your own messages", 403);
      }

      const isSystemMessage = !!this.enrichmentService.parseWorkshopReference(
        message.content
      );
      const canEditResult = this.validationService.canEditMessage(
        message.createdAt,
        message.editCount || 0,
        isSystemMessage
      );
      if (!canEditResult.ok) return canEditResult;

      const contentValidation =
        this.validationService.validateMessageContent(content);
      if (!contentValidation.ok) return contentValidation;

      const updatedMessage = await this.messageRepository.update(messageId, {
        content: contentValidation.data,
        updatedAt: new Date(),
        editCount: (message.editCount || 0) + 1,
      });

      return success({
        messageId: updatedMessage.id,
        conversationId: updatedMessage.conversationId,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("updateMessage", {
          userId,
          resourceId: messageId,
        })
      );
    }
  }

  async searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    limit: number = 50
  ): Promise<Result<MessageItem[]>> {
    try {
      const accessResult = await this.validateConversationAccess(
        userId,
        conversationId
      );
      if (!accessResult.ok) return accessResult;

      if (!query || query.trim().length === 0) {
        return failure("Search query cannot be empty", 400);
      }

      const messages = await this.messageRepository.searchMessages(
        accessResult.data.appUser.id,
        conversationId,
        query.trim(),
        limit
      );

      const messagesWithDetails = await Promise.all(
        messages.map((message) =>
          this.enrichmentService.enrichMessageEntity(message)
        )
      );

      return success(messagesWithDetails);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("searchMessages", {
          userId,
          resourceId: conversationId,
          details: { query, limit },
        })
      );
    }
  }

  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<Result<{ success: boolean; conversationId: string }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;
      const message = await this.messageRepository.findById(messageId);
      if (!message) return failure("Message not found", 404);

      if (message.senderId !== appUser.id) {
        return failure("You can only delete your own messages", 403);
      }

      if (message.deletedAt) {
        return failure("Message is already deleted", 400);
      }

      const isSystemMessage = !!this.enrichmentService.parseWorkshopReference(
        message.content
      );
      const canDeleteResult = this.validationService.canDeleteMessage(
        message.createdAt,
        isSystemMessage
      );
      if (!canDeleteResult.ok) return canDeleteResult;

      const deletedMessage = await this.messageRepository.delete(messageId);

      return success({
        success: true,
        conversationId: deletedMessage.conversationId,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("deleteMessage", {
          userId,
          resourceId: messageId,
        })
      );
    }
  }
}
