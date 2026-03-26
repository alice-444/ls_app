"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  Users,
  CheckCircle,
  Info,
  Trash2,
  Flag,
  LifeBuoy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { authClient } from "@/lib/auth-server-client";
import type { NotificationEntity } from "@/lib/notifications/repositories/notification.repository.interface";

export default function AdminNotificationsPage() {
  const router = useRouter();
  const socket = useSocket();
  const { data: session } = authClient.useSession();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data: notifications, refetch: refetchNotifications } =
    trpc.notification.getNotifications.useQuery({ limit: 100, offset: 0 }, {
      enabled: !!session?.user?.id,
    });

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.notification.getUnreadCount.useQuery(undefined, {
      enabled: !!session?.user?.id,
    });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation();
  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation();
  const deleteNotificationMutation = trpc.notification.deleteNotification.useMutation();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      refetchNotifications();
      refetchUnreadCount();
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("notification-updated", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("notification-updated", handleNewNotification);
    };
  }, [socket, refetchNotifications, refetchUnreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "NEW_REPORT":
        return <Flag className="h-5 w-5 text-red-500" />;
      case "NEW_FEEDBACK_MODERATION":
        return <MessageSquare className="h-5 w-5 text-amber-500" />;
      case "NEW_SUPPORT_REQUEST":
        return <LifeBuoy className="h-5 w-5 text-blue-500" />;
      case "system":
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "NEW_REPORT":
        return "Signalement";
      case "NEW_FEEDBACK_MODERATION":
        return "Modération";
      case "NEW_SUPPORT_REQUEST":
        return "Support";
      case "system":
        return "Système";
      default:
        return "Notification";
    }
  };

  const handleNotificationClick = (notification: NotificationEntity) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const filteredNotifications = (notifications || []).filter((n: NotificationEntity) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vos Notifications Admin</h1>
          <p className="text-muted-foreground">Alertes système et actions requises.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/notifications/bulk")}
          >
            <Users className="h-4 w-4 mr-2" /> Segmentation & Bulk
          </Button>
          <Button
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate(undefined, { onSuccess: () => { refetchNotifications(); refetchUnreadCount(); } })}
            disabled={!unreadCount?.count}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Tout marquer comme lu
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === "all" ? "default" : "ghost"} onClick={() => setFilter("all")}>Toutes</Button>
        <Button variant={filter === "unread" ? "default" : "ghost"} onClick={() => setFilter("unread")}>
          Non lues {unreadCount?.count ? `(${unreadCount.count})` : ""}
        </Button>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-white dark:bg-slate-900">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">Aucune notification pour le moment.</p>
          </div>
        ) : (
          filteredNotifications.map((n: NotificationEntity) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${n.isRead ? "" : "border-l-4 border-l-primary bg-primary/5"}`}
              onClick={() => handleNotificationClick(n)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 p-2 rounded-full bg-background border">
                  {getNotificationIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-sm">{n.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-[10px] uppercase">{getTypeLabel(n.type)}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotificationMutation.mutate({ notificationId: n.id }, { onSuccess: () => refetchNotifications() });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
