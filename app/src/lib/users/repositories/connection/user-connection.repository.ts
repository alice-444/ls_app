import type { PrismaClient } from '@/lib/prisma-server';
import type {
  IUserConnectionRepository,
  UserConnectionEntity,
} from "./user-connection.repository.interface";

export class PrismaUserConnectionRepository
  implements IUserConnectionRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findConnectionBetweenUsers(
    appUserId1: string,
    appUserId2: string
  ): Promise<UserConnectionEntity | null> {
    const connection = await this.prisma.user_connection.findFirst({
      where: {
        OR: [
          {
            requesterId: appUserId1,
            receiverId: appUserId2,
          },
          {
            requesterId: appUserId2,
            receiverId: appUserId1,
          },
        ],
      },
    });

    if (!connection) return null;

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async findById(connectionId: string): Promise<UserConnectionEntity | null> {
    const connection = await this.prisma.user_connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) return null;

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async create(data: {
    id: string;
    requesterId: string;
    receiverId: string;
    status: "PENDING";
    updatedAt: Date;
  }): Promise<UserConnectionEntity> {
    const connection = await this.prisma.user_connection.create({
      data,
    });

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async update(
    connectionId: string,
    data: {
      status?: "PENDING" | "ACCEPTED" | "REJECTED";
      updatedAt: Date;
    }
  ): Promise<UserConnectionEntity> {
    const connection = await this.prisma.user_connection.update({
      where: { id: connectionId },
      data,
    });

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async delete(connectionId: string): Promise<void> {
    await this.prisma.user_connection.delete({
      where: { id: connectionId },
    });
  }

  async findPendingRequestsReceivedBy(
    userId: string
  ): Promise<UserConnectionEntity[]> {
    const connections = await this.prisma.user_connection.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return connections.map((connection: any) => ({
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    }));
  }

  async findAcceptedConnectionsFor(
    userId: string
  ): Promise<UserConnectionEntity[]> {
    const connections = await this.prisma.user_connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return connections.map((connection: any) => ({
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    }));
  }

  async findPendingRequestsSentBy(
    userId: string
  ): Promise<UserConnectionEntity[]> {
    const connections = await this.prisma.user_connection.findMany({
      where: {
        requesterId: userId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return connections.map((connection: any) => ({
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status as "PENDING" | "ACCEPTED" | "REJECTED",
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    }));
  }
}
