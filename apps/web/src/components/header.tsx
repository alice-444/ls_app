"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Coins, Plus } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { NotificationBell } from "./notification-bell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { getUserRole } from "@/lib/api-client";
import { trpc } from "@/utils/trpc";
import { useSocket } from "@/lib/socket-client";

// Constants
const REFETCH_INTERVALS = {
  MESSAGES: 30000, // 30 seconds
  CREDITS: 60000, // 60 seconds
} as const;

// Types
type NavLink = {
  to: string;
  label: string;
  showBadge?: boolean;
};

type UserRole = "MENTOR" | "APPRENANT" | null | undefined;

const COMMON_LINKS: NavLink[] = [
  { to: "/community", label: "Communité" },
  { to: "/dashboard", label: "Dashboard" },
];

const MENTOR_LINKS: NavLink[] = [
  { to: "/my-workshops", label: "Mes Ateliers" },
  { to: "/workshop-editor", label: "Atelab" },
];

const APPRENTICE_LINKS: NavLink[] = [
  { to: "/workshop-room", label: "e-Atelier" },
];

const ADDITIONAL_COMMON_LINKS: NavLink[] = [
  { to: "/inbox", label: "Messages", showBadge: true },
  { to: "/network", label: "Connexions" },
];

function getRoleBasedLinks(userRole: UserRole): NavLink[] {
  if (userRole === "MENTOR") return MENTOR_LINKS;
  if (userRole === "APPRENANT") return APPRENTICE_LINKS;
  return [];
}

function formatBadgeCount(count: number): string {
  return count > 9 ? "9+" : String(count);
}

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const socket = useSocket();

  const { data: unreadCount, refetch: refetchUnreadCount } =
    trpc.messaging.getUnreadConversationsCount.useQuery(undefined, {
      enabled: !!session,
      refetchInterval: REFETCH_INTERVALS.MESSAGES,
    });

  const { data: creditBalance } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: REFETCH_INTERVALS.CREDITS,
  });

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });

  useEffect(() => {
    if (!socket || !session) return;

    const handleNewMessage = () => refetchUnreadCount();
    const handleConversationUpdated = () => refetchUnreadCount();

    socket.on("new-message", handleNewMessage);
    socket.on("conversation-updated", handleConversationUpdated);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("conversation-updated", handleConversationUpdated);
    };
  }, [socket, session, refetchUnreadCount]);

  const links = useMemo(() => {
    if (!session) return [];
    return [
      ...COMMON_LINKS,
      ...getRoleBasedLinks(userRole),
      ...ADDITIONAL_COMMON_LINKS,
    ];
  }, [session, userRole]);

  const renderNavLink = ({ to, label, showBadge }: NavLink) => {
    const hasBadge = showBadge && unreadCount && unreadCount.count > 0;
    return (
      <Link key={to} href={to} className={hasBadge ? "relative" : ""}>
        {label}
        {hasBadge && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
          >
            {formatBadgeCount(unreadCount.count)}
          </Badge>
        )}
      </Link>
    );
  };

  const renderCreditsSection = () => {
    if (!session || creditBalance === undefined) return null;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary font-medium text-sm">
          <Coins className="w-4 h-4" />
          <span>{creditBalance.balance} Credits</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/buy-credits")}
          className="h-8"
        >
          <Plus className="w-3 h-3 mr-1" />
          Acheter
        </Button>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">{links.map(renderNavLink)}</nav>
        <div className="flex items-center gap-3">
          {renderCreditsSection()}
          {session && <NotificationBell />}
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
