"use client";

import React, { useEffect } from "react";
import { useSocket } from "@/lib/socket-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bell, AlertOctagon, LifeBuoy, MessageSquare } from "lucide-react";

interface AdminNotificationData {
  type: "NEW_REPORT" | "NEW_FEEDBACK_MODERATION" | "NEW_SUPPORT_REQUEST";
  message: string;
  details?: {
    actionUrl?: string;
  };
  createdAt: string;
}

const NOTIFICATION_CONFIG: Record<string, { title: string; icon: React.ReactNode; color: string }> = {
  NEW_REPORT: {
    title: "Nouveau Signalement",
    icon: <AlertOctagon className="h-5 w-5 text-rose-500" />,
    color: "rose",
  },
  NEW_SUPPORT_REQUEST: {
    title: "Nouveau Ticket Support",
    icon: <LifeBuoy className="h-5 w-5 text-blue-500" />,
    color: "blue",
  },
  NEW_FEEDBACK_MODERATION: {
    title: "Modération de Feedback",
    icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
    color: "amber",
  },
};

export function AdminNotificationListener() {
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const handleAdminNotification = (data: AdminNotificationData) => {
      const config = NOTIFICATION_CONFIG[data.type] || {
        title: "Alerte Admin",
        icon: <Bell className="h-5 w-5 text-brand" />,
        color: "brand",
      };

      toast(config.title, {
        description: data.message,
        icon: config.icon,
        duration: 10000, // Les alertes admin durent plus longtemps
        action: data.details?.actionUrl ? {
          label: "Voir",
          onClick: () => router.push(data.details!.actionUrl!),
        } : undefined,
      });

      // On peut aussi jouer un son discret si besoin
      // const audio = new Audio('/sounds/notification.mp3');
      // audio.play().catch(() => {});
    };

    socket.on("admin:new-notification", handleAdminNotification);

    return () => {
      socket.off("admin:new-notification", handleAdminNotification);
    };
  }, [socket, router]);

  return null; // Composant invisible
}
