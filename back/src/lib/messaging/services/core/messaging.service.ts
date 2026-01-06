import { Result, failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { generateInternalId } from "../../../utils/id-generator";
import type { AppUserRepository } from "../../../users/repositories";
import type {
  IConversationRepository,
  ConversationEntity,
} from "../../repositories/conversation.repository.interface";
import type { IMessageRepository } from "../../repositories/message.repository.interface";
import type {
  IMessagingService,
  ConversationListItem,
  MessageItem,
} from "./messaging.service.interface";
import { verifyUserExists } from "../../../auth/services/user-helpers";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IMessageValidationService } from "../validation/message-validation.service.interface";
import type { IMessageEnrichmentService } from "../enrichment/message-enrichment.service.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";
import { prisma } from "../../../common";
import type { IUserBlockService } from "../../../users/services/moderation/user-block.service.interface";
import { logger } from "../../../common/logger";

export class MessagingService implements IMessagingService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: IMessageValidationService,
    private readonly enrichmentService: IMessageEnrichmentService,
    private readonly userBlockService: IUserBlockService,
    private readonly workshopRepository?: IWorkshopRepository,
    private readonly prismaClient?: PrismaClient
  ) {}

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

  private async createWorkshopReferenceMessage(
    conversationId: string,
    senderId: string,
    workshopId: string
  ): Promise<void> {
    const { workshopTitle, workshopDate } = await this.enrichWithWorkshopInfo(
      workshopId
    );
    if (workshopTitle) {
      const systemMessageContent = JSON.stringify({
        type: "workshop_reference",
        workshopId: workshopId,
        workshopTitle: workshopTitle,
        workshopDate: workshopDate,
      });
      await this.messageRepository.create({
        id: generateInternalId(),
        conversationId,
        senderId,
        content: systemMessageContent,
        replyToMessageId: null,
      });
    }
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

      const blockedUsersResult =
        await this.userBlockService.getAllBlockedAppUserIds(appUser.id);
      const blockedAppUserIds = new Set<string>();
      if (blockedUsersResult.ok) {
        blockedUsersResult.data.blockedByUser.forEach((id) =>
          blockedAppUserIds.add(id)
        );
        blockedUsersResult.data.blockedUser.forEach((id) =>
          blockedAppUserIds.add(id)
        );
      } else {
        logger.warn("Error loading blocked users, continuing without filter", {
          userId: appUser.userId,
          error: blockedUsersResult.error,
        });
      }

      const conversations =
        await this.conversationRepository.findConversationsForUser(appUser.id);

      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const otherAppUserId =
            conversation.participant1Id === appUser.id
              ? conversation.participant2Id
              : conversation.participant1Id;

          if (blockedAppUserIds.has(otherAppUserId)) {
            logger.debug("Conversation filtered due to block", {
              viewerUserId: appUser.userId,
              blockedAppUserId: otherAppUserId,
              conversationId: conversation.id,
            });
            return null;
          }

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

          let formattedLastMessageContent: string | null = null;
          if (lastMessage) {
            formattedLastMessageContent =
              this.enrichmentService.formatWorkshopReferenceContent(
                lastMessage.content
              );
          }

          const isPinned = await this.isConversationPinned(
            appUser.id,
            conversation.id
          );

          return {
            conversationId: conversation.id,
            otherUserId: otherAppUser.userId,
            otherUserName,
            otherUserDisplayName: identityCard?.displayName || null,
            otherUserPhotoUrl: identityCard?.photoUrl || null,
            otherUserRole: otherAppUser.role,
            lastMessage: lastMessage
              ? {
                  content: formattedLastMessageContent || lastMessage.content,
                  createdAt: lastMessage.createdAt,
                }
              : null,
            unreadCount,
            updatedAt: conversation.updatedAt,
            workshopId: conversation.workshopId,
            workshopTitle,
            workshopDate,
            isPinned,
          };
        })
      );

      const validConversations = conversationsWithDetails.filter(
        (conv): conv is ConversationListItem => conv !== null
      );

      return success(validConversations);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getConversations", { userId })
      );
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

      const prismaClient = this.prismaClient || prisma;
      const result = await (prismaClient as any).$transaction(
        async (tx: any) => {
          let conversation =
            await this.conversationRepository.findConversationBetweenUsersWithTransaction(
              appUser1.id,
              appUser2.id,
              tx
            );

          if (!conversation) {
            try {
              conversation =
                await this.conversationRepository.createWithTransaction(
                  {
                    id: generateInternalId(),
                    participant1Id: appUser1.id,
                    participant2Id: appUser2.id,
                    workshopId: workshopId || null,
                    updatedAt: new Date(),
                  },
                  tx
                );
            } catch (error: any) {
              if (
                error?.code === "P2002" ||
                error?.message?.includes("Unique constraint")
              ) {
                conversation =
                  await this.conversationRepository.findConversationBetweenUsersWithTransaction(
                    appUser1.id,
                    appUser2.id,
                    tx
                  );
                if (!conversation) {
                  throw new Error("Failed to create or find conversation");
                }
              } else {
                throw error;
              }
            }

            if (workshopId && conversation) {
              await this.createWorkshopReferenceMessage(
                conversation.id,
                appUser1.id,
                workshopId
              );
            }
          } else if (workshopId) {
            const previousWorkshopId = conversation.workshopId;
            conversation =
              await this.conversationRepository.updateWithTransaction(
                conversation.id,
                {
                  workshopId: workshopId,
                  updatedAt: new Date(),
                },
                tx
              );
            if (previousWorkshopId !== workshopId) {
              await this.createWorkshopReferenceMessage(
                conversation.id,
                appUser1.id,
                workshopId
              );
            }
          }

          return conversation;
        },
        {
          isolationLevel: "Serializable",
          timeout: 10000,
        }
      );

      if (!result) {
        return failure("Failed to create or find conversation", 500);
      }

      return success({ conversationId: result.id });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getOrCreateConversation", {
          userId: userId1,
          details: { userId2, workshopId },
        })
      );
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

      const otherParticipantId =
        conversation.participant1Id === appUser.id
          ? conversation.participant2Id
          : conversation.participant1Id;

      const otherAppUser = await this.appUserRepository.findByAppUserId(
        otherParticipantId
      );
      if (otherAppUser) {
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
            user1BlockedUser2,
            user2BlockedUser1,
            conversationId,
          });
          return failure("Cannot send message to this user", 403);
        }
      }

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
      return handleError(
        error,
        createErrorContext("markMessagesAsRead", {
          userId,
          resourceId: conversationId,
        })
      );
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
      return handleError(
        error,
        createErrorContext("getConversationDetails", {
          userId,
          resourceId: conversationId,
        })
      );
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
      return handleError(
        error,
        createErrorContext("getUnreadConversationsCount", { userId })
      );
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
      return handleError(
        error,
        createErrorContext("deleteConversation", {
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
      return handleError(
        error,
        createErrorContext("deleteMessage", {
          userId,
          resourceId: messageId,
        })
      );
    }
  }

  private async isConversationPinned(
    appUserId: string,
    conversationId: string
  ): Promise<boolean> {
    try {
      const client = this.prismaClient || prisma;
      const pin = await client.conversation_pin.findUnique({
        where: {
          conversationId_appUserId: {
            conversationId,
            appUserId,
          },
        },
      });
      return !!pin;
    } catch (error) {
      logger.error("Error checking if conversation is pinned", {
        appUserId,
        conversationId,
        error,
      });
      return false;
    }
  }

  async pinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) {
        return userResult;
      }

      const appUser = userResult.data.appUser;

      // Verify conversation exists and user is a participant
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (!conversation) {
        return failure("Conversation not found", 404);
      }

      if (
        conversation.participant1Id !== appUser.id &&
        conversation.participant2Id !== appUser.id
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      const client = this.prismaClient || prisma;

      // Check if already pinned
      const existingPin = await client.conversation_pin.findUnique({
        where: {
          conversationId_appUserId: {
            conversationId,
            appUserId: appUser.id,
          },
        },
      });

      if (existingPin) {
        return success({ success: true });
      }

      // Create pin
      await client.conversation_pin.create({
        data: {
          id: generateInternalId(),
          conversationId,
          appUserId: appUser.id,
          createdAt: new Date(),
        },
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("pinConversation", {
          userId,
          resourceId: conversationId,
        })
      );
    }
  }

  async unpinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) {
        return userResult;
      }

      const appUser = userResult.data.appUser;

      // Verify conversation exists and user is a participant
      const conversation = await this.conversationRepository.findById(
        conversationId
      );
      if (!conversation) {
        return failure("Conversation not found", 404);
      }

      if (
        conversation.participant1Id !== appUser.id &&
        conversation.participant2Id !== appUser.id
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      const client = this.prismaClient || prisma;

      // Delete pin if it exists
      await client.conversation_pin.deleteMany({
        where: {
          conversationId,
          appUserId: appUser.id,
        },
      });

      return success({ success: true });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("unpinConversation", {
          userId,
          resourceId: conversationId,
        })
      );
    }
  }
}
