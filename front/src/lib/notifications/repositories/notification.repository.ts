import type {
  INotificationRepository,
  NotificationEntity,
  CreateNotificationInput,
} from "./notification.repository.interface";
import { PrismaClient } from '@/lib/prisma-server';

export class PrismaNotificationRepository implements INotificationRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.create({
      data: {
        id: data.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        actionUrl: data.actionUrl || null,
      },
    });

    return this.mapToEntity(notification);
  }

  async findById(notificationId: string): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return null;
    }

    return this.mapToEntity(notification);
  }

  async findByUserId(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return notifications.map(this.mapToEntity);
  }

  async findUnreadByUserId(userId: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
    });

    return notifications.map(this.mapToEntity);
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationEntity> {
    const notification = await this.prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return this.mapToEntity(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result.count;
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.delete({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  private mapToEntity(notification: any): NotificationEntity {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actionUrl: notification.actionUrl,
    };
  }
}
