"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { authClient } from "@/lib/auth-client";

export function NotificationBell() {
  const router = useRouter();
  const socket = useSocket();
  const { data: session } = authClient.useSession();

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.notification.getUnreadCount.useQuery(undefined, {
      enabled: !!session,
      refetchInterval: 30000,
    });

  const { data: recentNotifications, refetch: refetchRecentNotifications } =
    trpc.notification.getRecentNotifications.useQuery(
      { limit: 5 },
      {
        enabled: !!session,
        refetchInterval: 30000,
      }
    );

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetchUnreadCount();
      refetchRecentNotifications();
    },
  });

  useEffect(() => {
    if (!socket || !session) return;

    const handleNewNotification = () => {
      refetchUnreadCount();
      refetchRecentNotifications();
    };

    const handleNotificationUpdate = () => {
      refetchUnreadCount();
      refetchRecentNotifications();
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("notification-updated", handleNotificationUpdate);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("notification-updated", handleNotificationUpdate);
    };
  }, [socket, session, refetchUnreadCount, refetchRecentNotifications]);

  const handleNotificationClick = (notification: {
    id: string;
    isRead: boolean;
    actionUrl?: string | null;
  }) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate({ notificationId: notification.id });
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const count = unreadCount?.count || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Bell className="h-12 w-12" strokeWidth={2.5} />
          {count > 0 && (
            <Badge
              className="absolute top-0 right-0 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs font-medium border-0 bg-[#FF8C42] text-white shadow-sm"
            >
              {count > 9 ? "9+" : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {count > 0 && (
              <Link
                href="/notifications"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Voir tout
              </Link>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {recentNotifications && recentNotifications.length > 0 ? (
              <div className="divide-y">
                {recentNotifications.map((notification: { id: string; isRead: boolean; title?: string; message?: string; createdAt: string; type?: string; actionUrl?: string | null }) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`w-full p-4 text-left cursor-pointer hover:bg-accent transition-colors ${
                      notification.isRead ? "" : "bg-primary/5"
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex flex-col gap-1">
                      <p
                        className={`text-sm font-medium ${
                          notification.isRead
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Aucune notification
              </div>
            )}
          </div>
          {recentNotifications && recentNotifications.length > 0 && (
            <div className="p-2 border-t">
              <Link href="/notifications">
                <Button variant="ghost" className="w-full text-xs">
                  Voir toutes les notifications
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
