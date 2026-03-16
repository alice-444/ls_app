import type { PrismaClient } from '@/lib/prisma-server';
import type {
  IMessageRepository,
  MessageEntity,
} from "./message.repository.interface";

function mapToEntity(raw: any): MessageEntity {
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    senderId: raw.senderId,
    content: raw.content,
    isRead: raw.isRead,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt || null,
    editCount: raw.editCount || 0,
    replyToMessageId: raw.replyToMessageId || null,
    deletedAt: raw.deletedAt || null,
  };
}


export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(messageId: string): Promise<MessageEntity | null> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    return message ? mapToEntity(message) : null;
  }

  async findMessagesForConversation(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<MessageEntity[]> {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return messages.map(mapToEntity);
  }

  async findLastMessageForConversation(
    conversationId: string
  ): Promise<MessageEntity | null> {
    const message = await this.prisma.message.findFirst({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
    });

    return message ? mapToEntity(message) : null;
  }

  async countUnreadMessagesForUser(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return 0;

    return this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
    });
  }

  async create(data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    replyToMessageId?: string | null;
  }): Promise<MessageEntity> {
    const message = await this.prisma.message.create({
      data: {
        id: data.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
      },
    });

    return mapToEntity(message);
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<string[]> {
    const unreadFilter = {
      conversationId,
      senderId: { not: userId },
      isRead: false,
    };

    const messages = await this.prisma.message.findMany({
      where: unreadFilter,
      select: { id: true },
    });

    if (messages.length === 0) {
      return [];
    }

    await this.prisma.message.updateMany({
      where: unreadFilter,
      data: { isRead: true },
    });

    return messages.map((m: any) => m.id);
  }

  async update(
    messageId: string,
    data: {
      content: string;
      updatedAt: Date;
      editCount: number;
    }
  ): Promise<MessageEntity> {
    const message = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: data.content,
        updatedAt: data.updatedAt,
      },
    });

    return mapToEntity(message);
  }

  async searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    limit: number = 50
  ): Promise<MessageEntity[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        content: { contains: query, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.map(mapToEntity);
  }

  async delete(messageId: string): Promise<MessageEntity> {
    const message = await this.prisma.message.delete({
      where: { id: messageId },
    });

    return mapToEntity(message);
  }
}
