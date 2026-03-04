import type { INotificationService } from "./notification.service.interface";
import type { INotificationRepository } from "../repositories/notification.repository.interface";
import type { Result } from "../../common/types";
import type { AppUserRepository } from "../../users/repositories";
import type { INotificationEventEmitter } from "./notification-event-emitter.interface";
import type { IUserBlockService } from "../../users/services/moderation/user-block.service.interface";
import { success, failure } from "../../common/types";
import { generateInternalId } from "../../utils/id-generator";
import { logger } from "../../common/logger";
import type { PrismaClient } from '@/lib/prisma';

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly eventEmitter: INotificationEventEmitter,
    private readonly userBlockService: IUserBlockService | undefined,
    private readonly prisma: PrismaClient
  ) {}

  private async getAppUserId(userId: string): Promise<string | null> {
    const appUser = await this.appUserRepository.findByUserId(userId);
    return appUser?.id ?? null;
  }

  async notifyAdmin(
    type: "NEW_REPORT" | "NEW_FEEDBACK_MODERATION" | "NEW_SUPPORT_REQUEST",
    message: string,
    actionUrl?: string
  ): Promise<Result<void>> {
    try {
      const adminUsers = await this.prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { userId: true },
      });

      for (const admin of adminUsers) {
        if (admin.userId) {
          await this.createNotification(
            admin.userId,
            {
              type,
              title: "Notification Admin",
              message,
              actionUrl,
            },
            "system" // System sender
          );
        }
      }
      return success(undefined);
    } catch (error) {
      logger.error("Failed to notify admins", error, { type, message, actionUrl });
      return failure("Failed to notify admins", 500);
    }
  }

  async createNotification(
    userId: string,
    input: {
      type: string;
      title: string;
      message: string;
      actionUrl?: string | null;
    },
    senderUserId?: string | null
  ): Promise<
    Result<
      import("../repositories/notification.repository.interface").NotificationEntity
    >
  > {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      if (senderUserId && this.userBlockService) {
        const blockResult = await this.userBlockService.areUsersBlocked(
          senderUserId,
          appUserId
        );
        if (!blockResult.ok) {
          logger.warn("Error checking block status before notification", {
            senderUserId,
            recipientUserId: appUserId,
            error: blockResult.error,
            notificationType: input.type,
          });
        } else {
          const { user1BlockedUser2, user2BlockedUser1 } = blockResult.data;
          if (user1BlockedUser2 || user2BlockedUser1) {
            logger.debug("Notification blocked due to user block", {
              senderUserId,
              recipientUserId: appUserId,
              user1BlockedUser2,
              user2BlockedUser1,
              notificationType: input.type,
            });
            return success({
              id: generateInternalId(),
              userId: appUserId,
              type: input.type,
              title: input.title,
              message: input.message,
              isRead: false,
              createdAt: new Date(),
              actionUrl: input.actionUrl || null,
            });
          }
        }
      }

      const notification = await this.notificationRepository.create({
        id: generateInternalId(),
        userId: appUserId,
        type: input.type,
        title: input.title,
        message: input.message,
        actionUrl: input.actionUrl || null,
      });

      this.eventEmitter.emitNewNotification(appUserId, notification);

      return success(notification);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to create notification",
        500
      );
    }
  }

  async getNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<
    Result<
      import("../repositories/notification.repository.interface").NotificationEntity[]
    >
  > {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      const notifications = await this.notificationRepository.findByUserId(
        appUserId,
        limit,
        offset
      );
      return success(notifications);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to get notifications",
        500
      );
    }
  }

  async getUnreadCount(userId: string): Promise<Result<{ count: number }>> {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      const count = await this.notificationRepository.countUnreadByUserId(
        appUserId
      );
      return success({ count });
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to get unread count",
        500
      );
    }
  }

  async getRecentNotifications(
    userId: string,
    limit: number = 5
  ): Promise<
    Result<
      import("../repositories/notification.repository.interface").NotificationEntity[]
    >
  > {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      const notifications = await this.notificationRepository.findByUserId(
        appUserId,
        limit,
        0
      );
      return success(notifications);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to get recent notifications",
        500
      );
    }
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<
    Result<
      import("../repositories/notification.repository.interface").NotificationEntity
    >
  > {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      const notification = await this.notificationRepository.markAsRead(
        notificationId,
        appUserId
      );

      this.eventEmitter.emitNotificationUpdate(appUserId);

      return success(notification);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to mark notification as read",
        500
      );
    }
  }

  async markAllAsRead(userId: string): Promise<Result<{ count: number }>> {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      const count = await this.notificationRepository.markAllAsRead(appUserId);

      this.eventEmitter.emitNotificationUpdate(appUserId);

      return success({ count });
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to mark all notifications as read",
        500
      );
    }
  }

  async deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<Result<void>> {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      await this.notificationRepository.delete(notificationId, appUserId);

      this.eventEmitter.emitNotificationUpdate(appUserId);

      return success(undefined);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to delete notification",
        500
      );
    }
  }
}
