import { Result, failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { generateInternalId } from "../../../utils/id-generator";
import type { AppUserRepository } from "../../../users/repositories";
import type { IConversationRepository } from "../../repositories/conversation.repository.interface";
import type { IMessageRepository } from "../../repositories/message.repository.interface";
import type { IConversationService } from "./conversation.service.interface";
import type { ConversationListItem } from "./messaging.service.interface";
import { verifyUserExists } from "../../../auth/services/user-helpers";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IMessageEnrichmentService } from "../enrichment/message-enrichment.service.interface";
import type { IUserBlockService } from "../../../users/services/moderation/user-block.service.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";
import { prisma } from "../../../common";
import { logger } from "../../../common/logger";

export class ConversationService implements IConversationService {
  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
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
    if (!userCheck.ok) return userCheck;

    const appUser = await this.appUserRepository.findByUserId(userId);
    if (!appUser) return failure("User not found", 404);

    return success({ appUser });
  }

  private async enrichWithWorkshopInfo(
    workshopId: string | null
  ): Promise<{ workshopTitle: string | null; workshopDate: Date | null }> {
    if (!workshopId || !this.workshopRepository) {
      return { workshopTitle: null, workshopDate: null };
    }

    const workshop = await this.workshopRepository.findById(workshopId);
    return {
      workshopTitle: workshop?.title ?? null,
      workshopDate: workshop?.date ?? null,
    };
  }

  async getConversations(
    userId: string
  ): Promise<Result<ConversationListItem[]>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;

      const blockedAppUserIds = await this.getBlockedAppUserIds(appUser);

      const conversations =
        await this.conversationRepository.findConversationsForUser(appUser.id);

      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const otherAppUserId =
            conversation.participant1Id === appUser.id
              ? conversation.participant2Id
              : conversation.participant1Id;

          if (blockedAppUserIds.has(otherAppUserId)) return null;

          return this.buildConversationListItem(
            conversation,
            appUser,
            otherAppUserId
          );
        })
      );

      return success(
        conversationsWithDetails.filter(
          (conv): conv is ConversationListItem => conv !== null
        )
      );
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getConversations", { userId })
      );
    }
  }

  private async getBlockedAppUserIds(appUser: any): Promise<Set<string>> {
    const blockedAppUserIds = new Set<string>();
    const blockedUsersResult =
      await this.userBlockService.getAllBlockedAppUserIds(appUser.id);

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
    return blockedAppUserIds;
  }

  private async buildConversationListItem(
    conversation: any,
    appUser: any,
    otherAppUserId: string
  ): Promise<ConversationListItem | null> {
    const otherAppUser = await this.appUserRepository.findByAppUserId(
      otherAppUserId
    );
    if (!otherAppUser) return null;

    const [otherUserName, identityCard, lastMessage, unreadCount, workshopInfo, isPinned] =
      await Promise.all([
        this.appUserRepository.findUserNameByUserId(otherAppUser.userId),
        this.appUserRepository.findIdentityCardByUserId(otherAppUser.userId),
        this.messageRepository.findLastMessageForConversation(conversation.id),
        this.messageRepository.countUnreadMessagesForUser(conversation.id, appUser.id),
        this.enrichWithWorkshopInfo(conversation.workshopId),
        this.isConversationPinned(appUser.id, conversation.id),
      ]);

    let formattedLastMessageContent: string | null = null;
    if (lastMessage) {
      formattedLastMessageContent =
        this.enrichmentService.formatWorkshopReferenceContent(lastMessage.content);
    }

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
      workshopTitle: workshopInfo.workshopTitle,
      workshopDate: workshopInfo.workshopDate,
      isPinned,
    };
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
      if (!user1Check.ok) return user1Check;

      const user2Check = await verifyUserExists(userId2);
      if (!user2Check.ok) return user2Check;

      const appUser1 = await this.appUserRepository.findByUserId(userId1);
      const appUser2 = await this.appUserRepository.findByUserId(userId2);

      if (!appUser1 || !appUser2) {
        return failure("One or both users not found", 404);
      }

      const client = this.prismaClient || prisma;
      const result = await (client as any).$transaction(
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
                { workshopId, updatedAt: new Date() },
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
        { isolationLevel: "Serializable", timeout: 10000 }
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
        workshopId,
        workshopTitle,
        workshopDate,
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
      if (!userResult.ok) return userResult;

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
        if (unreadCount > 0) totalUnreadCount++;
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

  async pinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) return failure("Conversation not found", 404);

      if (
        conversation.participant1Id !== appUser.id &&
        conversation.participant2Id !== appUser.id
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      const client = this.prismaClient || prisma;

      const existingPin = await client.conversation_pin.findUnique({
        where: {
          conversationId_appUserId: { conversationId, appUserId: appUser.id },
        },
      });

      if (existingPin) return success({ success: true });

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
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) return failure("Conversation not found", 404);

      if (
        conversation.participant1Id !== appUser.id &&
        conversation.participant2Id !== appUser.id
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      const client = this.prismaClient || prisma;
      await client.conversation_pin.deleteMany({
        where: { conversationId, appUserId: appUser.id },
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

  private async isConversationPinned(
    appUserId: string,
    conversationId: string
  ): Promise<boolean> {
    try {
      const client = this.prismaClient || prisma;
      const pin = await client.conversation_pin.findUnique({
        where: {
          conversationId_appUserId: { conversationId, appUserId },
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
}
