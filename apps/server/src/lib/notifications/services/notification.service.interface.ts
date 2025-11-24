import type { Result } from "../../common/types";
import type {
  NotificationEntity,
  CreateNotificationInput,
} from "../repositories/notification.repository.interface";

export interface INotificationService {
  createNotification(
    userId: string,
    input: Omit<CreateNotificationInput, "id" | "userId">
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
}
