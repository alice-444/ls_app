import type { PrismaClient } from "../../../../../prisma/generated/client/client";
import type {
  IMessageReactionRepository,
  MessageReactionEntity,
} from "./message-reaction.repository.interface";

export class PrismaMessageReactionRepository
  implements IMessageReactionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findByMessageId(messageId: string): Promise<MessageReactionEntity[]> {
    const reactions = await this.prisma.message_reaction.findMany({
      where: { messageId },
      orderBy: { createdAt: "asc" },
    });

    return reactions.map((reaction: any) => ({
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    }));
  }

  async findByMessageIdAndUserId(
    messageId: string,
    userId: string
  ): Promise<MessageReactionEntity[]> {
    const reactions = await this.prisma.message_reaction.findMany({
      where: { messageId, userId },
      orderBy: { createdAt: "asc" },
    });

    return reactions.map((reaction: any) => ({
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    }));
  }

  async findById(reactionId: string): Promise<MessageReactionEntity | null> {
    const reaction = await this.prisma.message_reaction.findUnique({
      where: { id: reactionId },
    });

    if (!reaction) return null;

    return {
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    };
  }

  async create(data: {
    id: string;
    messageId: string;
    userId: string;
    emoji: string;
  }): Promise<MessageReactionEntity> {
    const reaction = await this.prisma.message_reaction.create({
      data: {
        id: data.id,
        messageId: data.messageId,
        userId: data.userId,
        emoji: data.emoji,
      },
    });

    return {
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    };
  }

  async delete(reactionId: string): Promise<void> {
    await this.prisma.message_reaction.delete({
      where: { id: reactionId },
    });
  }

  async deleteByMessageIdAndUserIdAndEmoji(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    await this.prisma.message_reaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji,
      },
    });
  }
}
