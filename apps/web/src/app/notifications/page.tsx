"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

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
    trpc.notification.getNotifications.useQuery(
      { limit: 100, offset: 0 },
      {
        refetchInterval: 30000,
      }
    );

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.notification.getUnreadCount.useQuery(undefined, {
      refetchInterval: 30000,
    });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  const markAllAsReadMutation = trpc.notification.markAllAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchUnreadCount();
    },
  });

  const deleteNotificationMutation =
    trpc.notification.deleteNotification.useMutation({
      onSuccess: () => {
        refetchNotifications();
        refetchUnreadCount();
      },
    });

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

  const markAsRead = (id: string) => {
    markAsReadMutation.mutate({ notificationId: id });
  };

  const deleteNotification = (id: string) => {
    deleteNotificationMutation.mutate({ notificationId: id });
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications = (notifications || []).filter((notif) => {
    if (filter === "unread") return !notif.isRead;
    return true;
  });

  const unreadCountValue = unreadCount?.count || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col space-y-6 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                Notifications
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Restez informé de vos activités et mises à jour
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4"
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
                disabled={
                  unreadCountValue === 0 || markAllAsReadMutation.isPending
                }
                className="w-full sm:w-auto h-10 px-4"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Filtres :
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="text-xs sm:text-sm h-9 px-3"
              >
                Toutes ({notifications?.length || 0})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className="text-xs sm:text-sm h-9 px-3"
              >
                Non lues ({unreadCountValue})
              </Button>
            </div>
          </div>
        </div>

        {/* Paramètres des notifications */}
        {showSettings && (
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="h-5 w-5" />
                Paramètres des notifications
              </CardTitle>
              <CardDescription className="text-sm">
                Configurez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      Notifications par email
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                    <p className="font-medium text-sm">Nouveaux followers</p>
                    <p className="text-xs text-muted-foreground">
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
                    <p className="font-medium text-sm">Nouvelles évaluations</p>
                    <p className="text-xs text-muted-foreground">
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
            </CardContent>
          </Card>
        )}

        {/* Liste des notifications */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
                <Bell className="h-12 w-16 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-base sm:text-lg font-medium mb-2">
                  Aucune notification
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filter === "unread"
                    ? "Toutes vos notifications ont été lues"
                    : "Vous n'avez pas encore de notifications"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 shadow-sm ${
                  !notification.isRead
                    ? "border-l-4 border-l-primary bg-primary/5"
                    : ""
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        !notification.isRead ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium text-sm sm:text-base ${
                              !notification.isRead
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                              locale: fr,
                            }
                          )}
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              disabled={markAsReadMutation.isPending}
                              className="text-xs h-8 px-3"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}

                          {notification.actionUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(notification.actionUrl!)
                              }
                              className="text-xs h-8 px-3"
                            >
                              Voir
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            disabled={deleteNotificationMutation.isPending}
                            className="text-xs h-8 px-3"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
