export interface NotificationEntity {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl: string | null;
}

export interface CreateNotificationInput {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string | null;
}

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<NotificationEntity>;
  findById(notificationId: string): Promise<NotificationEntity | null>;
  findByUserId(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<NotificationEntity[]>;
  findUnreadByUserId(userId: string): Promise<NotificationEntity[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationEntity>;
  markAllAsRead(userId: string): Promise<number>;
  delete(notificationId: string, userId: string): Promise<void>;
}
