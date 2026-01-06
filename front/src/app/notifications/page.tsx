"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  MessageSquare,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  Info,
  Filter,
  Trash2,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageCard } from "@/components/layout/PageCard";

export default function NotificationsPage() {
  const router = useRouter();
  const socket = useSocket();
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    newFollowers: true,
    newReviews: true,
  });

  const { data: notifications, refetch: refetchNotifications } =
    trpc.notification.getNotifications.useQuery({ limit: 100, offset: 0 }, {
      refetchInterval: 30000,
    } as any);

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.notification.getUnreadCount.useQuery(undefined, {
      refetchInterval: 30000,
    } as any);

  const markAsReadMutation = trpc.notification.markAsRead.useMutation();

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation();

  const deleteNotificationMutation =
    trpc.notification.deleteNotification.useMutation();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      refetchNotifications();
      refetchUnreadCount();
    };

    const handleNotificationUpdate = () => {
      refetchNotifications();
      refetchUnreadCount();
    };

    socket.on("new-notification", handleNewNotification);
    socket.on("notification-updated", handleNotificationUpdate);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("notification-updated", handleNotificationUpdate);
    };
  }, [socket, refetchNotifications, refetchUnreadCount]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5" />;
      case "learning":
        return <BookOpen className="h-5 w-5" />;
      case "social":
        return <Users className="h-5 w-5" />;
      case "reminder":
        return <Calendar className="h-5 w-5" />;
      case "system":
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "message":
        return "Message";
      case "learning":
        return "Apprentissage";
      case "social":
        return "Social";
      case "reminder":
        return "Rappel";
      case "system":
        return "Système";
      default:
        return "Notification";
    }
  };

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

  const markAsRead = (id: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    markAsReadMutation.mutate(
      { notificationId: id },
      {
        onSuccess: () => {
          refetchNotifications();
          refetchUnreadCount();
        },
      }
    );
  };

  const deleteNotification = (id: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    deleteNotificationMutation.mutate(
      { notificationId: id },
      {
        onSuccess: () => {
          refetchNotifications();
          refetchUnreadCount();
        },
      }
    );
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        refetchNotifications();
        refetchUnreadCount();
      },
    });
  };

  const filteredNotifications = (notifications || []).filter(
    (notif: { isRead: boolean }) => {
      if (filter === "unread") return !notif.isRead;
      return true;
    }
  );

  const unreadCountValue = unreadCount?.count || 0;

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        subtitle="Restez informé de vos activités et mises à jour"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={`${
              filter === "all"
                ? "bg-[#ffb647] border border-[#ffb647] text-[#161616] hover:bg-[#ff9f1a]"
                : "border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] bg-white dark:bg-transparent"
            } rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Toutes ({notifications?.length || 0})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={`${
              filter === "unread"
                ? "bg-[#ffb647] border border-[#ffb647] text-[#161616] hover:bg-[#ff9f1a]"
                : "border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] bg-white dark:bg-transparent"
            } rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold`}
          >
            Non lues ({unreadCountValue})
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold bg-white dark:bg-transparent flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Paramètres
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showSettings ? "rotate-180" : ""
              }`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCountValue === 0 || markAllAsReadMutation.isPending}
            className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold bg-white dark:bg-transparent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        </div>
      </div>

      {showSettings && (
        <PageCard
          title="Paramètres des notifications"
          description="Configurez tes préférences de notifications"
          className="mb-6"
          headerClassName="flex items-center gap-2"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm text-[#26547c] dark:text-[#e6e6e6]">
                  Notifications par email
                </p>
                <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  Recevoir des notifications par email
                </p>
              </div>
              <Switch
                checked={notificationSettings.email}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    email: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm text-[#26547c] dark:text-[#e6e6e6]">
                  Nouveaux followers
                </p>
                <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  Quand quelqu'un vous suit
                </p>
              </div>
              <Switch
                checked={notificationSettings.newFollowers}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    newFollowers: checked,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm text-[#26547c] dark:text-[#e6e6e6]">
                  Nouvelles évaluations
                </p>
                <p className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                  Quand vous recevez une évaluation
                </p>
              </div>
              <Switch
                checked={notificationSettings.newReviews}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    newReviews: checked,
                  }))
                }
              />
            </div>
          </div>
        </PageCard>
      )}

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] shadow-lg">
            <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
              <Bell className="h-12 w-16 sm:h-16 sm:w-16 mx-auto mb-4 text-[rgba(38,84,124,0.32)] dark:text-[rgba(230,230,230,0.32)]" />
              <h3 className="text-base sm:text-lg font-medium mb-2 text-[#26547c] dark:text-[#e6e6e6]">
                Aucune notification
              </h3>
              <p className="text-xs sm:text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                {filter === "unread"
                  ? "Toutes vos notifications ont été lues"
                  : "Vous n'avez pas encore de notifications"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(
            (notification: {
              id: string;
              isRead: boolean;
              actionUrl?: string | null;
              type: string;
              title: string;
              message: string;
              createdAt: string;
            }) => {
              const isUnread = !notification.isRead;
              return (
                <Card
                  key={notification.id}
                  className={`transition-all duration-200 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] shadow-sm ${
                    isUnread
                      ? "border-l-4 border-l-[#ffb647] bg-[rgba(255,182,71,0.05)] dark:bg-[rgba(255,182,71,0.1)]"
                      : ""
                  } ${
                    notification.actionUrl
                      ? "cursor-pointer hover:shadow-md"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`p-2 sm:p-3 rounded-[12px] shrink-0 ${
                          isUnread
                            ? "bg-[rgba(255,182,71,0.15)] dark:bg-[rgba(255,182,71,0.25)]"
                            : "bg-[rgba(38,84,124,0.1)] dark:bg-[rgba(74,144,226,0.2)]"
                        }`}
                      >
                        <div className="text-[#26547c] dark:text-[#e6e6e6]">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2 sm:space-y-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-sm sm:text-base mb-1 ${
                                isUnread
                                  ? "text-[#26547c] dark:text-[#e6e6e6]"
                                  : "text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] bg-white dark:bg-transparent"
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2 border-t border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)]">
                          <span className="text-xs text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                                locale: fr,
                              }
                            )}
                          </span>

                          <div className="flex flex-wrap items-center gap-2">
                            {isUnread && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => markAsRead(notification.id, e)}
                                disabled={markAsReadMutation.isPending}
                                className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] h-8 px-3 text-xs font-semibold bg-white dark:bg-transparent"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Marquer comme lu
                              </Button>
                            )}

                            {notification.actionUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(notification.actionUrl!);
                                }}
                                className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#26547c] dark:text-[#e6e6e6] hover:bg-[rgba(255,182,71,0.1)] dark:hover:bg-[rgba(255,182,71,0.15)] hover:border-[#ffb647] dark:hover:border-[#ffb647] rounded-[32px] h-8 px-3 text-xs font-semibold bg-white dark:bg-transparent"
                              >
                                Voir
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) =>
                                deleteNotification(notification.id, e)
                              }
                              disabled={deleteNotificationMutation.isPending}
                              className="border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] text-[#f44336] dark:text-[#f44336] hover:bg-[rgba(244,67,54,0.1)] dark:hover:bg-[rgba(244,67,54,0.15)] hover:border-[#f44336] dark:hover:border-[#f44336] rounded-[32px] h-8 w-8 p-0 bg-white dark:bg-transparent"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )
        )}
      </div>
    </PageContainer>
  );
}
