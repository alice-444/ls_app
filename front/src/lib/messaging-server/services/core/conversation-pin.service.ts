import type { Result } from "../../../common";
import { failure, success, prisma } from "../../../common";
import { handleError, createErrorContext } from "../../../common/error-handler";
import type { IConversationRepository } from "../../repositories/conversation.repository.interface";
import type { PrismaClient } from '@/lib/prisma';

export interface IConversationPinService {
  pinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>>;

  unpinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>>;

  isConversationPinned(
    userId: string,
    conversationId: string
  ): Promise<boolean>;

  getPinnedConversationIds(userId: string): Promise<Set<string>>;
}

/**
 * Implementation of conversation pinning using conversation_pin model.
 */
export class ConversationPinService implements IConversationPinService {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly prismaClient: PrismaClient = prisma
  ) {}

  async pinConversation(
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      const conversation = await this.conversationRepository.findById(conversationId);
      if (!conversation) return failure("Conversation not found", 404);

      if (
        conversation.participant1Id !== userId &&
        conversation.participant2Id !== userId
      ) {
        return failure("You are not a participant of this conversation", 403);
      }

      await (this.prismaClient as any).conversation_pin.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        create: {
          conversationId,
          userId,
        },
        update: {},
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
    userId: string,
    conversationId: string
  ): Promise<Result<{ success: boolean }>> {
    try {
      await (this.prismaClient as any).conversation_pin.deleteMany({
        where: {
          conversationId,
          userId,
        },
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
    userId: string,
    conversationId: string
  ): Promise<boolean> {
    const pin = await (this.prismaClient as any).conversation_pin.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });
    return !!pin;
  }

  async getPinnedConversationIds(userId: string): Promise<Set<string>> {
    const pins = await (this.prismaClient as any).conversation_pin.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    return new Set(pins.map((p: any) => p.conversationId));
  }
}
