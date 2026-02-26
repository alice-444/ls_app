import { prisma } from "../../common";
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

const NOT_DELETED = { deletedAt: null } as const;

export class PrismaMessageRepository implements IMessageRepository {
  async findById(messageId: string): Promise<MessageEntity | null> {
    const message = await (prisma as any).message.findUnique({
      where: { id: messageId },
    });

    return message ? mapToEntity(message) : null;
  }

  async findMessagesForConversation(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<MessageEntity[]> {
    const messages = await (prisma as any).message.findMany({
      where: { conversationId, ...NOT_DELETED },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return messages.map(mapToEntity);
  }

  async findLastMessageForConversation(
    conversationId: string
  ): Promise<MessageEntity | null> {
    const message = await (prisma as any).message.findFirst({
      where: { conversationId, ...NOT_DELETED },
      orderBy: { createdAt: "desc" },
    });

    return message ? mapToEntity(message) : null;
  }

  async countUnreadMessagesForUser(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return 0;

    return (prisma as any).message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
        ...NOT_DELETED,
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
    const message = await (prisma as any).message.create({
      data: {
        id: data.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        replyToMessageId: data.replyToMessageId || null,
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
      ...NOT_DELETED,
    };

    const messages = await (prisma as any).message.findMany({
      where: unreadFilter,
      select: { id: true },
    });

    if (messages.length === 0) {
      return [];
    }

    await (prisma as any).message.updateMany({
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
    const message = await (prisma as any).message.update({
      where: { id: messageId },
      data: {
        content: data.content,
        updatedAt: data.updatedAt,
        editCount: data.editCount,
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
    const messages = await (prisma as any).message.findMany({
      where: {
        conversationId,
        content: { contains: query, mode: "insensitive" },
        ...NOT_DELETED,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.map(mapToEntity);
  }

  async delete(messageId: string): Promise<MessageEntity> {
    const message = await (prisma as any).message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });

    return mapToEntity(message);
  }
}
