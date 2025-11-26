import { prisma } from "../../common";
import type {
  IMessageRepository,
  MessageEntity,
} from "./message.repository.interface";

export class PrismaMessageRepository implements IMessageRepository {
  async findById(messageId: string): Promise<MessageEntity | null> {
    const message = await (prisma as any).message.findUnique({
      where: { id: messageId },
    });

    if (!message) return null;

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    };
  }

  async findMessagesForConversation(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<MessageEntity[]> {
    const messages = await (prisma as any).message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return messages.map((message: any) => ({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    }));
  }

  async findLastMessageForConversation(
    conversationId: string
  ): Promise<MessageEntity | null> {
    const message = await (prisma as any).message.findFirst({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!message) return null;

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    };
  }

  async countUnreadMessagesForUser(
    conversationId: string,
    userId: string
  ): Promise<number> {
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return 0;

    const count = await (prisma as any).message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
        deletedAt: null,
      },
    });

    return count;
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

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    };
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<string[]> {
    const messages = await (prisma as any).message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (messages.length === 0) {
      return [];
    }

    await (prisma as any).message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
      },
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

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    };
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
        content: {
          contains: query,
          mode: "insensitive",
        },
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return messages.map((message: any) => ({
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    }));
  }

  async delete(messageId: string): Promise<MessageEntity> {
    const message = await (prisma as any).message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt || null,
      editCount: message.editCount || 0,
      replyToMessageId: message.replyToMessageId || null,
      deletedAt: message.deletedAt || null,
    };
  }
}
