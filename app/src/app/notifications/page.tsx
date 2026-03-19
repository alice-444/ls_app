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
  GraduationCap,
  Coins,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { PageContainer } from "@/components/shared/layout/PageContainer";
import { PageCard } from "@/components/shared/layout/PageCard";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-server-client";

export default function NotificationsPage() {
  const router = useRouter();
  const socket = useSocket();
  const { data: session } = authClient.useSession();
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    newFollowers: true,
    newReviews: true,
  });

  const { data: notifications, refetch: refetchNotifications } =
    trpc.notification.getNotifications.useQuery({ limit: 100, offset: 0 }, {
      enabled: !!session?.user?.id,
      refetchInterval: 30000,
    });

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.notification.getUnreadCount.useQuery(undefined, {
      enabled: !!session?.user?.id,
      refetchInterval: 30000,
    });

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
      case "MESSAGE":
        return <MessageSquare className="h-5 w-5" />;
      case "workshop":
      case "WORKSHOP":
      case "WORKSHOP_REQUEST":
      case "REQUEST_ACCEPTED":
      case "REQUEST_REJECTED":
        return <GraduationCap className="h-5 w-5" />;
      case "cashback":
      case "CASHBACK":
        return <Coins className="h-5 w-5" />;
      case "learning":
        return <BookOpen className="h-5 w-5" />;
      case "social":
        return <Users className="h-5 w-5" />;
      case "reminder":
      case "WORKSHOP_REMINDER":
        return <Calendar className="h-5 w-5" />;
      case "WORKSHOP_FEEDBACK_REQUEST":
        return <Star className="h-5 w-5" />;
      case "system":
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "message":
      case "MESSAGE":
        return "Message";
      case "workshop":
      case "WORKSHOP":
      case "WORKSHOP_REQUEST":
      case "REQUEST_ACCEPTED":
      case "REQUEST_REJECTED":
        return "Atelier";
      case "cashback":
      case "CASHBACK":
        return "Récompense";
      case "learning":
        return "Apprentissage";
      case "social":
        return "Social";
      case "reminder":
      case "WORKSHOP_REMINDER":
        return "Rappel";
      case "WORKSHOP_FEEDBACK_REQUEST":
        return "Avis";
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
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Notifications" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Reste informé de tes activités et mises à jour
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={`rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold ${filter === "all"
                ? "bg-brand border-brand text-ls-heading hover:bg-brand-hover"
                : "border-border text-ls-heading hover:bg-brand/10 hover:border-brand"
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Toutes ({notifications?.length || 0})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={`rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold ${filter === "unread"
                ? "bg-brand border-brand text-ls-heading hover:bg-brand-hover"
                : "border-border text-ls-heading hover:bg-brand/10 hover:border-brand"
              }`}
          >
            Non lues ({unreadCountValue})
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-border text-ls-heading hover:bg-brand/10 hover:border-brand flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Paramètres
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${showSettings ? "rotate-180" : ""
                }`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={unreadCountValue === 0 || markAllAsReadMutation.isPending}
            className="rounded-full h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-border text-ls-heading hover:bg-brand/10 hover:border-brand flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        </div>
      </motion.div>

      {showSettings && (
        <PageCard
          title="Paramètres des notifications"
          description="Configure tes préférences de notifications"
          className="mb-6 border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl"
          headerClassName="flex items-center gap-2"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-sm text-ls-heading">
                  Notifications par email
                </p>
                <p className="text-xs text-ls-muted">
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
                <p className="font-medium text-sm text-ls-heading">
                  Nouveaux followers
                </p>
                <p className="text-xs text-ls-muted">
                  Quand quelqu'un te suit
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
                <p className="font-medium text-sm text-ls-heading">
                  Nouvelles évaluations
                </p>
                <p className="text-xs text-ls-muted">
                  Quand tu reçois une évaluation
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

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {filteredNotifications.length === 0 ? (
          <Card className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl">
            <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
              <Bell className="h-12 w-16 sm:h-16 sm:w-16 mx-auto mb-4 text-ls-muted opacity-50" />
              <h3 className="text-base sm:text-lg font-medium mb-2 text-ls-heading">
                Aucune notification
              </h3>
              <p className="text-xs sm:text-sm text-ls-muted">
                {filter === "unread"
                  ? "Toutes tes notifications ont été lues"
                  : "Tu n'as pas encore de notifications"}
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
                  className={`transition-all duration-200 border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl shadow-xl ${isUnread
                      ? "border-l-4 border-l-brand bg-brand/5"
                      : ""
                    } ${notification.actionUrl
                      ? "cursor-pointer hover:shadow-lg hover:border-brand/30"
                      : ""
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`p-2 sm:p-3 rounded-2xl shrink-0 ${isUnread
                            ? "bg-brand/15"
                            : "bg-muted/50"
                          }`}
                      >
                        <div className={isUnread ? "text-brand" : "text-ls-muted"}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col space-y-2 sm:space-y-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-sm sm:text-base mb-1 ${isUnread
                                  ? "text-ls-heading"
                                  : "text-ls-muted"
                                }`}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-ls-muted">
                              {notification.message}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs border border-border text-ls-heading rounded-full"
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pt-2 border-t border-border">
                          <span className="text-xs text-ls-muted">
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
                                className="rounded-full h-8 px-3 text-xs font-semibold border-border text-ls-heading hover:bg-brand/10 hover:border-brand"
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
                                className="rounded-full h-8 px-3 text-xs font-semibold border-border text-ls-heading hover:bg-brand/10 hover:border-brand"
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
                              className="rounded-full h-8 w-8 p-0 border-border text-destructive hover:bg-destructive/10 hover:border-destructive"
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
      </motion.div>
    </PageContainer>
  );
}
