import { prisma } from "../../common";
import type {
  IUserConnectionRepository,
  UserConnectionEntity,
} from "./user-connection.repository.interface";

export class PrismaUserConnectionRepository
  implements IUserConnectionRepository
{
  async findConnectionBetweenUsers(
    appUserId1: string,
    appUserId2: string
  ): Promise<UserConnectionEntity | null> {
    const connection = await (prisma as any).user_connection.findFirst({
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
      status: connection.status,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async findById(connectionId: string): Promise<UserConnectionEntity | null> {
    const connection = await (prisma as any).user_connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) return null;

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status,
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
    const connection = await (prisma as any).user_connection.create({
      data,
    });

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status,
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
    const connection = await (prisma as any).user_connection.update({
      where: { id: connectionId },
      data,
    });

    return {
      id: connection.id,
      requesterId: connection.requesterId,
      receiverId: connection.receiverId,
      status: connection.status,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
    };
  }

  async delete(connectionId: string): Promise<void> {
    await (prisma as any).user_connection.delete({
      where: { id: connectionId },
    });
  }
}

