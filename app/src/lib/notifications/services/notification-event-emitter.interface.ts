import type { NotificationEntity } from "../repositories/notification.repository.interface";

export interface INotificationEventEmitter {
  emitNewNotification(userId: string, notification: NotificationEntity): void;

  emitNotificationUpdate(userId: string): void;

  emitAdminNotification(type: string, message: string, details?: any): void;
}
