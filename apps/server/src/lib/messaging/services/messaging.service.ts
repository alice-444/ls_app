import { Result, failure, success } from "../../common";
import { generateInternalId } from "../../utils/id-generator";
import type { AppUserRepository } from "../../users/repositories";
import type {
  IConversationRepository,
  ConversationEntity,
} from "../repositories/conversation.repository.interface";
import type { IMessageRepository } from "../repositories/message.repository.interface";
import type {
  IMessagingService,
  ConversationListItem,
  MessageItem,
} from "./messaging.service.interface";
import { verifyUserExists } from "../../auth/services/user-helpers";
import type { IWorkshopRepository } from "../../workshops/repositories/workshop.repository.interface";
import { MessageValidationService } from "./message-validation.service";
import { MessageEnrichmentService } from "./message-enrichment.service";

export class MessagingService implements IMessagingService {
  private readonly validationService: MessageValidationService;
  private readonly enrichmentService: MessageEnrichmentService;

  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly workshopRepository?: IWorkshopRepository
  ) {
    this.validationService = new MessageValidationService();
    this.enrichmentService = new MessageEnrichmentService(
      this.appUserRepository,
      this.messageRepository
    );
  }

  private async validateUserAndGetAppUser(userId: string): Promise<
    Result<{
      appUser: NonNullable<
        Awaited<ReturnType<AppUserRepository["findByUserId"]>>
      >;
    }>
  > {
    const userCheck = await verifyUserExists(userId);
    if (!userCheck.ok) {
      return userCheck;
    }

    const appUser = await this.appUserRepository.findByUserId(userId);
    if (!appUser) {
      return failure("User not found", 404);
    }

    return success({ appUser });
  }

  private async validateConversationAccess(
    userId: string,
    conversationId: string
  ): Promise<Result<{ appUser: any; conversation: ConversationEntity }>> {
    const userResult = await this.validateUserAndGetAppUser(userId);
    if (!userResult.ok) {
      return userResult;
    }

    const conversation = await this.conversationRepository.findById(
      conversationId
    );
    if (!conversation) {
      return failure("Conversation not found", 404);
    }

    if (
      conversation.participant1Id !== userResult.data.appUser.id &&
      conversation.participant2Id !== userResult.data.appUser.id
    ) {
      return failure("You are not a participant in this conversation", 403);
    }

    return success({ appUser: userResult.data.appUser, conversation });
  }

  private async enrichWithWorkshopInfo(
    workshopId: string | null
  ): Promise<{ workshopTitle: string | null; workshopDate: Date | null }> {
    let workshopTitle: string | null = null;
    let workshopDate: Date | null = null;

    if (workshopId && this.workshopRepository) {
      const workshop = await this.workshopRepository.findById(workshopId);
      if (workshop) {
        workshopTitle = workshop.title;
        workshopDate = workshop.date;
      }
    }

    return { workshopTitle, workshopDate };
  }

  async getConversations(
    userId: string
  ): Promise<Result<ConversationListItem[]>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) {
        return userResult;
      }

      const appUser = userResult.data.appUser;

      const conversations =
        await this.conversationRepository.findConversationsForUser(appUser.id);

      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const otherAppUserId =
            conversation.participant1Id === appUser.id
              ? conversation.participant2Id
              : conversation.participant1Id;

          const otherAppUser = await this.appUserRepository.findByAppUserId(
            otherAppUserId
          );
          if (!otherAppUser) {
            return null;
          }

          const otherUserName =
            await this.appUserRepository.findUserNameByUserId(
              otherAppUser.userId
            );
          const identityCard =
            await this.appUserRepository.findIdentityCardByUserId(
              otherAppUser.userId
            );

          const lastMessage =
            await this.messageRepository.findLastMessageForConversation(
              conversation.id
            );

          const unreadCount =
            await this.messageRepository.countUnreadMessagesForUser(
              conversation.id,
              appUser.id
            );

          const { workshopTitle, workshopDate } =
            await this.enrichWithWorkshopInfo(conversation.workshopId);

          return {
            conversationId: conversation.id,
            otherUserId: otherAppUser.userId,
            otherUserName,
            otherUserDisplayName: identityCard?.displayName || null,
            otherUserPhotoUrl: identityCard?.photoUrl || null,
            otherUserRole: otherAppUser.role,
            lastMessage: lastMessage
              ? {
                  content: lastMessage.content,
                  createdAt: lastMessage.createdAt,
                }
              : null,
            unreadCount,
            updatedAt: conversation.updatedAt,
            workshopId: conversation.workshopId,
            workshopTitle,
            workshopDate,
          };
        })
      );

      const validConversations = conversationsWithDetails.filter(
        (conv): conv is ConversationListItem => conv !== null
      );

      return success(validConversations);
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getOrCreateConversation(
    userId1: string,
    userId2: string,
    workshopId?: string | null
  ): Promise<Result<{ conversationId: string }>> {
    try {
      if (userId1 === userId2) {
        return failure("Cannot create conversation with yourself", 400);
      }

      const user1Check = await verifyUserExists(userId1);
      if (!user1Check.ok) {
        return user1Check;
      }

      const user2Check = await verifyUserExists(userId2);
      if (!user2Check.ok) {
        return user2Check;
      }

      const appUser1 = await this.appUserRepository.findByUserId(userId1);
      const appUser2 = await this.appUserRepository.findByUserId(userId2);

      if (!appUser1 || !appUser2) {
        return failure("One or both users not found", 404);
      }

      let conversation =
        await this.conversationRepository.findConversationBetweenUsers(
          appUser1.id,
          appUser2.id
        );

      if (!conversation) {
        conversation = await this.conversationRepository.create({
          id: generateInternalId(),
          participant1Id: appUser1.id,
          participant2Id: appUser2.id,
          workshopId: workshopId || null,
          updatedAt: new Date(),
        });

        if (workshopId) {
          const { workshopTitle, workshopDate } =
            await this.enrichWithWorkshopInfo(workshopId);
          if (workshopTitle) {
            const systemMessageContent = JSON.stringify({
              type: "workshop_reference",
              workshopId: workshopId,
              workshopTitle: workshopTitle,
              workshopDate: workshopDate,
            });
            await this.messageRepository.create({
              id: generateInternalId(),
              conversationId: conversation.id,
              senderId: appUser1.id,
              content: systemMessageContent,
              replyToMessageId: null,
            });
          }
        }
      } else if (workshopId) {
        const previousWorkshopId = conversation.workshopId;
        conversation = await this.conversationRepository.update(
          conversation.id,
          {
            workshopId: workshopId,
            updatedAt: new Date(),
          }
        );
        if (previousWorkshopId !== workshopId) {
          const { workshopTitle, workshopDate } =
            await this.enrichWithWorkshopInfo(workshopId);
          if (workshopTitle) {
            const systemMessageContent = JSON.stringify({
              type: "workshop_reference",
              workshopId: workshopId,
              workshopTitle: workshopTitle,
              workshopDate: workshopDate,
            });
            await this.messageRepository.create({
              id: generateInternalId(),
              conversationId: conversation.id,
              senderId: appUser1.id,
              content: systemMessageContent,
              replyToMessageId: null,
            });
          }
        }
      }

      return success({ conversationId: conversation.id });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
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
      if (!accessResult.ok) {
        return accessResult;
      }

      const { appUser, conversation } = accessResult.data;

      const contentValidation =
        this.validationService.validateMessageContent(content);
      if (!contentValidation.ok) {
        return contentValidation;
      }

      const sanitizedContent = contentValidation.data;

      if (replyToMessageId) {
        const replyToMessage = await this.messageRepository.findById(
          replyToMessageId
        );
        if (!replyToMessage) {
          return failure("Message to reply to not found", 404);
        }
        if (replyToMessage.conversationId !== conversationId) {
          return failure(
            "Cannot reply to a message from another conversation",
            400
          );
        }
      }

      const message = await this.messageRepository.create({
        id: generateInternalId(),
        conversationId,
        senderId: appUser.id,
        content: sanitizedContent,
        replyToMessageId: replyToMessageId || null,
      });

      await this.conversationRepository.update(conversation.id, {
        updatedAt: new Date(),
      });

      return success({ messageId: message.id });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
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
      if (!accessResult.ok) {
        return accessResult;
      }

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
      return failure((error as Error).message, 500);
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
      if (!accessResult.ok) {
        return accessResult;
      }

      const { appUser } = accessResult.data;

      const messageIds = await this.messageRepository.markMessagesAsRead(
        conversationId,
        appUser.id
      );

      return success({ success: true, messageIds });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getConversationDetails(
    userId: string,
    conversationId: string
  ): Promise<
    Result<{
      workshopId: string | null;
      workshopTitle: string | null;
      workshopDate: Date | null;
    }>
  > {
    try {
      const accessResult = await this.validateConversationAccess(
        userId,
        conversationId
      );
      if (!accessResult.ok) {
        return accessResult;
      }

      const { conversation } = accessResult.data;
      const { workshopTitle, workshopDate } = await this.enrichWithWorkshopInfo(
        conversation.workshopId
      );

      return success({
        workshopId: conversation.workshopId,
        workshopTitle,
        workshopDate,
      });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async getUnreadConversationsCount(
    userId: string
  ): Promise<Result<{ count: number }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) {
        return userResult;
      }

      const appUser = userResult.data.appUser;

      const conversations =
        await this.conversationRepository.findConversationsForUser(appUser.id);

      let totalUnreadCount = 0;
      for (const conversation of conversations) {
        const unreadCount =
          await this.messageRepository.countUnreadMessagesForUser(
            conversation.id,
            appUser.id
          );
        if (unreadCount > 0) {
          totalUnreadCount++;
        }
      }

      return success({ count: totalUnreadCount });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async deleteConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const accessResult = await this.validateConversationAccess(
        userId,
        conversationId
      );
      if (!accessResult.ok) {
        return accessResult;
      }

      await this.conversationRepository.delete(conversationId);

      return success({ success: true });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }

  async updateMessage(
    userId: string,
    messageId: string,
    content: string
  ): Promise<Result<{ messageId: string; conversationId: string }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) {
        return userResult;
      }

      const appUser = userResult.data.appUser;

      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        return failure("Message not found", 404);
      }

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
      if (!canEditResult.ok) {
        return canEditResult;
      }

      const contentValidation =
        this.validationService.validateMessageContent(content);
      if (!contentValidation.ok) {
        return contentValidation;
      }

      const sanitizedContent = contentValidation.data;
      const now = new Date();

      const updatedMessage = await this.messageRepository.update(messageId, {
        content: sanitizedContent,
        updatedAt: now,
        editCount: (message.editCount || 0) + 1,
      });

      return success({
        messageId: updatedMessage.id,
        conversationId: updatedMessage.conversationId,
      });
    } catch (error) {
      return failure((error as Error).message, 500);
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
      if (!accessResult.ok) {
        return accessResult;
      }

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
      return failure((error as Error).message, 500);
    }
  }

  async deleteMessage(
    userId: string,
    messageId: string
  ): Promise<Result<{ success: boolean; conversationId: string }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) {
        return userResult;
      }

      const appUser = userResult.data.appUser;

      const message = await this.messageRepository.findById(messageId);
      if (!message) {
        return failure("Message not found", 404);
      }

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
      if (!canDeleteResult.ok) {
        return canDeleteResult;
      }

      const deletedMessage = await this.messageRepository.delete(messageId);

      return success({
        success: true,
        conversationId: deletedMessage.conversationId,
      });
    } catch (error) {
      return failure((error as Error).message, 500);
    }
  }
}
