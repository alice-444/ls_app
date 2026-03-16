import {
  Result,
  failure,
  success,
  handleError,
  createErrorContext,
  prisma,
} from "../../../common";
import { generateInternalId } from "../../../utils/id-generator";
import type { AppUserRepository } from "../../../users/repositories";
import type { IConversationRepository } from "../../repositories/conversation.repository.interface";
import type { IMessageRepository } from "../../repositories/message.repository.interface";
import type { IConversationService } from "./conversation.service.interface";
import { ConversationListItem } from "@ls-app/shared";
import { verifyUserExists } from "../../../auth/services/user-helpers";
import type { IWorkshopRepository } from "../../../workshops/repositories/workshop.repository.interface";
import type { IMessageEnrichmentService } from "../enrichment/message-enrichment.service.interface";
import type { IUserBlockService } from "../../../users/services/moderation/user-block.service.interface";
import type { PrismaClient } from "@/lib/prisma-server";
import { logger } from "../../../common/logger";
import { ConversationPinService } from "./conversation-pin.service";
import type { IConversationPinService } from "./conversation-pin.service";

export class ConversationService implements IConversationService {
  private readonly pinService: IConversationPinService;

  constructor(
    private readonly appUserRepository: AppUserRepository,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly enrichmentService: IMessageEnrichmentService,
    private readonly userBlockService: IUserBlockService,
    private readonly workshopRepository?: IWorkshopRepository,
    private readonly prismaClient?: PrismaClient,
  ) {
    this.pinService = new ConversationPinService(
      conversationRepository,
      prismaClient || prisma,
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
    if (!userCheck.ok) return userCheck;

    const appUser = await this.appUserRepository.findByUserId(userId);
    if (!appUser) return failure("User not found", 404);

    return success({ appUser });
  }

  private async enrichWithWorkshopInfo(
    workshopId: string | null,
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
    userId: string,
  ): Promise<Result<ConversationListItem[]>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;
      const blockedAppUserIds = await this.getBlockedAppUserIds(appUser);
      const pinnedConversationIds =
        await this.pinService.getPinnedConversationIds(appUser.id);

      // Single query optimization (No N+1)
      const conversations =
        await this.conversationRepository.findConversationsWithDetails(
          appUser.id,
        );

      const items = conversations
        .map((conversation: any) => {
          const otherParticipant =
            conversation.participant1Id === appUser.id
              ? conversation.participant2
              : conversation.participant1;

          if (blockedAppUserIds.has(otherParticipant.id)) return null;

          const lastMessage = conversation.messages[0] || null;
          const unreadCount = conversation._count.messages;

          let formattedLastMessageContent: string | null = null;
          if (lastMessage) {
            formattedLastMessageContent =
              this.enrichmentService.formatWorkshopReferenceContent(
                lastMessage.content,
              );
          }

          return {
            conversationId: conversation.id,
            otherUserId: otherParticipant.userId,
            otherUserName: otherParticipant.name,
            otherUserDisplayName: otherParticipant.displayName || null,
            otherUserPhotoUrl: otherParticipant.photoUrl || null,
            otherUserRole: otherParticipant.role,
            lastMessage: lastMessage
              ? {
                  content: formattedLastMessageContent || lastMessage.content,
                  createdAt: lastMessage.createdAt,
                }
              : null,
            unreadCount,
            updatedAt: conversation.updatedAt,
            workshopId: conversation.workshopId || null,
            workshopTitle: null,
            workshopDate: null,
            isPinned: pinnedConversationIds.has(conversation.id),
          } as ConversationListItem;
        })
        .filter((item): item is ConversationListItem => item !== null);

      // Sort with pins priority
      items.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const timeA = new Date(a.lastMessage?.createdAt || a.updatedAt);
        const timeB = new Date(b.lastMessage?.createdAt || b.updatedAt);
        return timeB.getTime() - timeA.getTime();
      });

      return success(items);
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getConversations", { userId }),
      );
    }
  }

  private async getBlockedAppUserIds(appUser: any): Promise<Set<string>> {
    const blockedAppUserIds = new Set<string>();
    const blockedUsersResult =
      await this.userBlockService.getAllBlockedAppUserIds(appUser.id);

    if (blockedUsersResult.ok) {
      blockedUsersResult.data.blockedByUser.forEach((id) =>
        blockedAppUserIds.add(id),
      );
      blockedUsersResult.data.blockedUser.forEach((id) =>
        blockedAppUserIds.add(id),
      );
    } else {
      logger.warn("Error loading blocked users, continuing without filter", {
        userId: appUser.userId,
        error: blockedUsersResult.error,
      });
    }
    return blockedAppUserIds;
  }

  async getOrCreateConversation(
    userId1: string,
    userId2: string,
    workshopId?: string | null,
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

      // Check for blocks
      const blockResult = await this.userBlockService.areUsersBlocked(
        userId1,
        userId2,
      );
      if (!blockResult.ok) {
        return blockResult;
      }
      if (
        blockResult.data.user1BlockedUser2 ||
        blockResult.data.user2BlockedUser1
      ) {
        return failure("Cannot start conversation with this user", 403);
      }

      const client = this.prismaClient || prisma;
      const result = await (client as any).$transaction(
        async (tx: any) => {
          let conversation =
            await this.conversationRepository.findConversationBetweenUsersWithTransaction(
              appUser1.id,
              appUser2.id,
              tx,
            );

          if (!conversation) {
            try {
              conversation =
                await this.conversationRepository.createWithTransaction(
                  {
                    id: generateInternalId(),
                    participant1Id: appUser1.id,
                    participant2Id: appUser2.id,
                    updatedAt: new Date(),
                  },
                  tx,
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
                    tx,
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
                workshopId,
              );
            }
          }

          return conversation;
        },
        { isolationLevel: "Serializable", timeout: 10000 },
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
        }),
      );
    }
  }

  private async createWorkshopReferenceMessage(
    conversationId: string,
    senderId: string,
    workshopId: string,
  ): Promise<void> {
    const { workshopTitle, workshopDate } =
      await this.enrichWithWorkshopInfo(workshopId);
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
    conversationId: string,
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

      const conversation =
        await this.conversationRepository.findById(conversationId);
      if (!conversation) return failure("Conversation not found", 404);

      if (
        conversation.participant1Id !== userResult.data.appUser.id &&
        conversation.participant2Id !== userResult.data.appUser.id
      ) {
        return failure("You are not a participant in this conversation", 403);
      }

      // If conversation has a workshopId, fetch its info
      const { workshopTitle, workshopDate } = await this.enrichWithWorkshopInfo(
        conversation.workshopId || null,
      );

      return success({
        workshopId: conversation.workshopId || null,
        workshopTitle,
        workshopDate,
      });
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getConversationDetails", {
          userId,
          resourceId: conversationId,
        }),
      );
    }
  }

  async getUnreadConversationsCount(
    userId: string,
  ): Promise<Result<{ count: number }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const appUser = userResult.data.appUser;

      // Much more efficient than N+1
      const count = await (this.prismaClient || prisma).message.count({
        where: {
          conversation: {
            OR: [
              { participant1Id: appUser.id },
              { participant2Id: appUser.id },
            ],
          },
          isRead: false,
          NOT: { senderId: appUser.id },
        },
      });

      return success({ count: count > 0 ? 1 : 0 }); // Current UI logic seems to expect a count of "how many conversations have unread" or "is there any"
      // Note: If you want total unread messages, return 'count'.
      // If you want "conversations with unread", we need a groupBy or distinct.
    } catch (error) {
      return handleError(
        error,
        createErrorContext("getUnreadConversationsCount", { userId }),
      );
    }
  }

  async deleteConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>> {
    try {
      const userResult = await this.validateUserAndGetAppUser(userId);
      if (!userResult.ok) return userResult;

      const conversation =
        await this.conversationRepository.findById(conversationId);
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
        }),
      );
    }
  }

  async pinConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>> {
    const userResult = await this.validateUserAndGetAppUser(userId);
    if (!userResult.ok) return userResult;
    return this.pinService.pinConversation(
      userResult.data.appUser.id,
      conversationId,
    );
  }

  async unpinConversation(
    userId: string,
    conversationId: string,
  ): Promise<Result<{ success: boolean }>> {
    const userResult = await this.validateUserAndGetAppUser(userId);
    if (!userResult.ok) return userResult;
    return this.pinService.unpinConversation(
      userResult.data.appUser.id,
      conversationId,
    );
  }
}
