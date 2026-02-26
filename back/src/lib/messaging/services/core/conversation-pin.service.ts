import type { Result } from "../../../common";
import { failure, success } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import { generateInternalId } from "../../../utils/id-generator";
import type { IConversationRepository } from "../../repositories/conversation.repository.interface";
import type { PrismaClient } from "../../../../../prisma/generated/client/client";
import { prisma as defaultPrisma } from "../../../common";
import { logger } from "../../../common/logger";

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

export class ConversationPinService implements IConversationPinService {
  private readonly client: PrismaClient;

  constructor(
    private readonly conversationRepository: IConversationRepository,
    prismaClient?: PrismaClient
  ) {
    this.client = (prismaClient || defaultPrisma) as PrismaClient;
  }

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

      const existingPin = await this.client.conversation_pin.findUnique({
        where: {
          conversationId_appUserId: { conversationId, appUserId },
        },
      });

      if (existingPin) return success({ success: true });

      await this.client.conversation_pin.create({
        data: {
          id: generateInternalId(),
          conversationId,
          appUserId,
          createdAt: new Date(),
        },
      });

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

      await this.client.conversation_pin.deleteMany({
        where: { conversationId, appUserId },
      });

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
    appUserId: string,
    conversationId: string
  ): Promise<boolean> {
    try {
      const pin = await this.client.conversation_pin.findUnique({
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
