import type { INotificationEventEmitter } from "./notification-event-emitter.interface";
import type { NotificationEntity } from "../repositories/notification.repository.interface";
import { getSocketServer } from "../../socket/server";

export class SocketNotificationEventEmitter
  implements INotificationEventEmitter
{
  emitNewNotification(userId: string, notification: NotificationEntity): void {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.to(`user:${userId}`).emit("new-notification", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      actionUrl: notification.actionUrl,
    });

    this.emitNotificationUpdate(userId);
  }

  emitNotificationUpdate(userId: string): void {
    const io = getSocketServer();
    if (!io) {
      return;
    }

    io.to(`user:${userId}`).emit("notification-updated");
  }
}
