import { BulkNotificationInput, SegmentationCriteria } from "@ls-app/shared";
import type { INotificationService } from "./notification.service.interface";
import type { INotificationRepository } from "../repositories/notification.repository.interface";
import type { Result } from "../../common/types";
import type { AppUserRepository } from "../../users/repositories";
import type { INotificationEventEmitter } from "./notification-event-emitter.interface";
import type { IUserBlockService } from "../../users/services/moderation/user-block.service.interface";
import { success, failure } from "../../common/types";
import { generateInternalId } from "../../utils/id-generator";
import { logger } from "../../common/logger";
import type { PrismaClient } from "@/lib/prisma-server";

type BulkUserWhereInput = NonNullable<
  Parameters<PrismaClient["user"]["findMany"]>[0]
>["where"];

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly appUserRepository: AppUserRepository,
    private readonly eventEmitter: INotificationEventEmitter,
    private readonly userBlockService: IUserBlockService | undefined,
    private readonly prisma: PrismaClient,
  ) {}

  private async getAppUserId(userId: string): Promise<string | null> {
    const appUser = await this.appUserRepository.findByUserId(userId);
    return appUser?.id ?? null;
  }

  async notifyAdmin(
    type: "NEW_REPORT" | "NEW_FEEDBACK_MODERATION" | "NEW_SUPPORT_REQUEST",
    message: string,
    actionUrl?: string,
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
            "system", // System sender
          );
        }
      }

      this.eventEmitter.emitAdminNotification(type, message, { actionUrl });

      return success(undefined);
    } catch (error) {
      logger.error("Failed to notify admins", error, {
        type,
        message,
        actionUrl,
      });
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
    senderUserId?: string | null,
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
          userId, // Use BetterAuth ID
        );
        if (blockResult.ok) {
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
        } else {
          logger.warn("Error checking block status before notification", {
            senderUserId,
            recipientUserId: appUserId,
            error: blockResult.error,
            notificationType: input.type,
          });
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
        500,
      );
    }
  }

  async getNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
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
        offset,
      );
      return success(notifications);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to get notifications",
        500,
      );
    }
  }

  async getUnreadCount(userId: string): Promise<Result<{ count: number }>> {
    try {
      const appUserId = await this.getAppUserId(userId);
      if (!appUserId) {
        return failure("User not found", 404);
      }

      const count =
        await this.notificationRepository.countUnreadByUserId(appUserId);
      return success({ count });
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to get unread count",
        500,
      );
    }
  }

  async getRecentNotifications(
    userId: string,
    limit: number = 5,
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
        0,
      );
      return success(notifications);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to get recent notifications",
        500,
      );
    }
  }

  async markAsRead(
    notificationId: string,
    userId: string,
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
        appUserId,
      );

      this.eventEmitter.emitNotificationUpdate(appUserId);

      return success(notification);
    } catch (error) {
      return failure(
        (error as Error).message || "Failed to mark notification as read",
        500,
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
        500,
      );
    }
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
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
        500,
      );
    }
  }

  private buildBulkNotificationWhere(
    criteria: SegmentationCriteria,
  ): BulkUserWhereInput {
    const where: BulkUserWhereInput = {};
    if (criteria.role) {
      where.role = criteria.role;
    }
    if (criteria.status) {
      where.status = criteria.status;
    }
    if (criteria.isPublished !== undefined) {
      where.isPublished = criteria.isPublished;
    }
    if (criteria.hasPublishedWorkshop !== undefined) {
      where.workshops_as_mentor = criteria.hasPublishedWorkshop
        ? { some: { status: "PUBLISHED" } }
        : { none: { status: "PUBLISHED" } };
    }
    if (
      criteria.minCredits !== undefined ||
      criteria.maxCredits !== undefined
    ) {
      where.creditBalance = {};
      if (criteria.minCredits !== undefined) {
        where.creditBalance.gte = criteria.minCredits;
      }
      if (criteria.maxCredits !== undefined) {
        where.creditBalance.lte = criteria.maxCredits;
      }
    }
    return where;
  }

  private buildBulkNotificationRows(
    users: { id: string; userId: string | null }[],
    payload: {
      type: string;
      title: string;
      message: string;
      actionUrl?: string;
    },
  ) {
    return users
      .filter((u) => u.userId)
      .map((u) => ({
        id: generateInternalId(),
        userId: u.id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        actionUrl: payload.actionUrl ?? null,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
  }

  private emitBulkNewNotificationEvents(
    notificationData: ReturnType<
      NotificationService["buildBulkNotificationRows"]
    >,
  ): void {
    if (notificationData.length >= 100) {
      return;
    }
    for (const notif of notificationData) {
      this.eventEmitter.emitNewNotification(notif.userId, notif as any);
    }
  }

  async sendBulkNotifications(
    input: BulkNotificationInput,
  ): Promise<Result<{ count: number }>> {
    try {
      const { criteria, title, message, type, actionUrl } = input;

      const users = await this.prisma.user.findMany({
        where: this.buildBulkNotificationWhere(criteria),
        select: { id: true, userId: true },
      });

      const notificationData = this.buildBulkNotificationRows(users, {
        type,
        title,
        message,
        actionUrl,
      });

      if (notificationData.length > 0) {
        await this.prisma.notification.createMany({
          data: notificationData,
        });
        this.emitBulkNewNotificationEvents(notificationData);
      }

      return success({ count: notificationData.length });
    } catch (error) {
      logger.error("Failed to send bulk notifications", error, { input });
      return failure("Failed to send bulk notifications", 500);
    }
  }
}
