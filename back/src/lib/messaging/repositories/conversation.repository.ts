import { prisma } from "../../common";
import type {
  IConversationRepository,
  ConversationEntity,
} from "./conversation.repository.interface";

export class PrismaConversationRepository implements IConversationRepository {
  async findConversationBetweenUsers(
    appUserId1: string,
    appUserId2: string
  ): Promise<ConversationEntity | null> {
    const conversation = await (prisma as any).conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: appUserId1,
            participant2Id: appUserId2,
          },
          {
            participant1Id: appUserId2,
            participant2Id: appUserId1,
          },
        ],
      },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findConversationBetweenUsersWithTransaction(
    appUserId1: string,
    appUserId2: string,
    tx: any
  ): Promise<ConversationEntity | null> {
    const conversation = await (tx as any).conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: appUserId1,
            participant2Id: appUserId2,
          },
          {
            participant1Id: appUserId2,
            participant2Id: appUserId1,
          },
        ],
      },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findById(conversationId: string): Promise<ConversationEntity | null> {
    const conversation = await (prisma as any).conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findConversationsForUser(
    appUserId: string
  ): Promise<ConversationEntity[]> {
    const conversations = await (prisma as any).conversation.findMany({
      where: {
        OR: [{ participant1Id: appUserId }, { participant2Id: appUserId }],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return conversations.map((conversation: any) => ({
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));
  }

  async create(data: {
    id: string;
    participant1Id: string;
    participant2Id: string;
    workshopId?: string | null;
    updatedAt: Date;
  }): Promise<ConversationEntity> {
    const conversation = await (prisma as any).conversation.create({
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async createWithTransaction(
    data: {
      id: string;
      participant1Id: string;
      participant2Id: string;
      workshopId?: string | null;
      updatedAt: Date;
    },
    tx: any
  ): Promise<ConversationEntity> {
    const conversation = await (tx as any).conversation.create({
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async update(
    conversationId: string,
    data: {
      workshopId?: string | null;
      updatedAt: Date;
    }
  ): Promise<ConversationEntity> {
    const conversation = await (prisma as any).conversation.update({
      where: { id: conversationId },
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async updateWithTransaction(
    conversationId: string,
    data: {
      workshopId?: string | null;
      updatedAt: Date;
    },
    tx: any
  ): Promise<ConversationEntity> {
    const conversation = await (tx as any).conversation.update({
      where: { id: conversationId },
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      workshopId: conversation.workshopId || null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async delete(conversationId: string): Promise<void> {
    await (prisma as any).conversation.delete({
      where: { id: conversationId },
    });
  }
}
