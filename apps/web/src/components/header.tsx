"use client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "./notification-bell";

export default function Header() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.messaging.getUnreadConversationsCount.useQuery(undefined, {
      enabled: !!session,
      refetchInterval: 30000,
    });

  useEffect(() => {
    if (!socket || !session) return;

    const handleNewMessage = () => {
      refetchUnreadCount();
    };

    const handleConversationUpdated = () => {
      refetchUnreadCount();
    };

    socket.on("new-message", handleNewMessage);
    socket.on("conversation-updated", handleConversationUpdated);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("conversation-updated", handleConversationUpdated);
    };
  }, [socket, session, refetchUnreadCount]);

  const {
    data: userRole,
    refetch: refetchUserRole,
    isLoading: isLoadingRole,
    error: roleError,
  } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });

  type NavLink = {
    to: string;
    label: string;
    showBadge?: boolean;
  };

  const commonLinks: NavLink[] = [
    { to: "/community", label: "Communité" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  const mentorLinks: NavLink[] = [
    { to: "/my-workshops", label: "Mes Ateliers" },
    { to: "/workshop-editor", label: "Atelab" },
  ];

  const apprenantLinks: NavLink[] = [
    { to: "/workshop-room", label: "e-Atelier" },
  ];

  const additionalCommonLinks: NavLink[] = [
    { to: "/inbox", label: "Messages", showBadge: true },
    { to: "/network", label: "Connexions" },
  ];

  const links = [
    ...commonLinks,
    ...(userRole === "MENTOR"
      ? mentorLinks
      : userRole === "APPRENANT"
      ? apprenantLinks
      : []),
    ...additionalCommonLinks,
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label, showBadge }) => {
            const hasBadge = showBadge && unreadCount && unreadCount.count > 0;
            return (
              <Link key={to} href={to} className={hasBadge ? "relative" : ""}>
                {label}
                {hasBadge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
                  >
                    {unreadCount.count > 9 ? "9+" : unreadCount.count}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
