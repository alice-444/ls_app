import type { BulkNotificationInput } from "@ls-app/shared";
import type { Result } from "../../common/types";
import type {
  NotificationEntity,
  CreateNotificationInput,
} from "../repositories/notification.repository.interface";

export interface INotificationService {
  createNotification(
    userId: string,
    input: Omit<CreateNotificationInput, "id" | "userId">,
    senderUserId?: string | null
  ): Promise<Result<NotificationEntity>>;

  getNotifications(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<Result<NotificationEntity[]>>;

  getUnreadCount(userId: string): Promise<Result<{ count: number }>>;

  getRecentNotifications(
    userId: string,
    limit?: number
  ): Promise<Result<NotificationEntity[]>>;

  markAsRead(
    notificationId: string,
    userId: string
  ): Promise<Result<NotificationEntity>>;

  markAllAsRead(userId: string): Promise<Result<{ count: number }>>;

  deleteNotification(
    notificationId: string,
    userId: string
  ): Promise<Result<void>>;

  notifyAdmin(
    type: "NEW_REPORT" | "NEW_FEEDBACK_MODERATION" | "NEW_SUPPORT_REQUEST",
    message: string,
    actionUrl?: string
  ): Promise<Result<void>>;

  sendBulkNotifications(
    input: BulkNotificationInput
  ): Promise<Result<{ count: number }>>;
}
