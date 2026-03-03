import type { PrismaClient } from "../../../../prisma/generated/client/client";
import type {
  IConversationRepository,
  ConversationEntity,
} from "./conversation.repository.interface";

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findConversationBetweenUsers(
    appUserId1: string,
    appUserId2: string
  ): Promise<ConversationEntity | null> {
    const conversation = await this.prisma.conversation.findFirst({
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
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findConversationBetweenUsersWithTransaction(
    appUserId1: string,
    appUserId2: string,
    tx: any
  ): Promise<ConversationEntity | null> {
    const conversation = await tx.conversation.findFirst({
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
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findById(conversationId: string): Promise<ConversationEntity | null> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) return null;

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async findConversationsForUser(
    appUserId: string
  ): Promise<ConversationEntity[]> {
    const conversations = await this.prisma.conversation.findMany({
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
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    }));
  }

  async create(data: {
    id: string;
    participant1Id: string;
    participant2Id: string;
    updatedAt: Date;
  }): Promise<ConversationEntity> {
    const conversation = await this.prisma.conversation.create({
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async createWithTransaction(
    data: {
      id: string;
      participant1Id: string;
      participant2Id: string;
      updatedAt: Date;
    },
    tx: any
  ): Promise<ConversationEntity> {
    const conversation = await tx.conversation.create({
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async update(
    conversationId: string,
    data: { updatedAt: Date }
  ): Promise<ConversationEntity> {
    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async updateWithTransaction(
    conversationId: string,
    data: { updatedAt: Date },
    tx: any
  ): Promise<ConversationEntity> {
    const conversation = await tx.conversation.update({
      where: { id: conversationId },
      data,
    });

    return {
      id: conversation.id,
      participant1Id: conversation.participant1Id,
      participant2Id: conversation.participant2Id,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  async delete(conversationId: string): Promise<void> {
    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }
}
