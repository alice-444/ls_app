"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import {
  Home,
  LayoutDashboard,
  UserSearch,
  PlusCircle,
  BookOpen,
  Users,
  MessageCircle,
  Info,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserRole = "MENTOR" | "APPRENANT" | null | undefined;

type NavItem = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  label: string;
  showBadge?: boolean;
  roles?: UserRole[];
};

const getNavItems = (userRole: UserRole): NavItem[] => {
  const items: NavItem[] = [
    {
      icon: Home,
      href: "/community",
      label: "Communauté",
    },
    {
      icon: LayoutDashboard,
      href: "/dashboard",
      label: "Tableau de bord",
    },
  ];

  if (userRole === "MENTOR") {
    items.push(
      {
        icon: PlusCircle,
        href: "/workshop-editor",
        label: "Créer un atelier",
      },
      {
        icon: BookOpen,
        href: "/my-workshops",
        label: "Mes Ateliers",
      }
    );
  } else if (userRole === "APPRENANT") {
    items.push({
      icon: UserSearch,
      href: "/mentors",
      label: "Mentors",
    });
    items.push({
      icon: BookOpen,
      href: "/workshop-room",
      label: "e-Atelier",
    });
  }

  items.push(
    {
      icon: Users,
      href: "/network",
      label: "Connexions",
    },
    {
      icon: MessageCircle,
      href: "/inbox",
      label: "Messages",
      showBadge: true,
    }
  );

  return items;
};

function formatBadgeCount(count: number): string {
  return count > 9 ? "9+" : String(count);
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0,
  });

  const { data: unreadCount } =
    trpc.messaging.getUnreadConversationsCount.useQuery(undefined, {
      enabled: !!session,
      refetchInterval: 30000,
      trpc: {},
    });

  if (!session || pathname === "/login") {
    return null;
  }

  const navItems = getNavItems(userRole);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </Button>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 bg-black/50 z-40 cursor-default"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Fermer le menu"
        />
      )}

      <aside
        className={cn(
          "bg-white dark:bg-gray-950 border-r border-[#d6dae4] dark:border-gray-800 flex flex-col items-center justify-between py-8 shrink-0 h-screen sticky top-0 z-40 transition-all duration-300",
          isExpanded ? "w-56 px-6" : "w-20 md:w-[120px] px-4 md:px-8",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="absolute -right-4 top-8 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:flex w-8 h-8 rounded-full bg-white dark:bg-gray-900 border border-[#d6dae4] dark:border-gray-700 hover:bg-[#FF8C42]/10 hover:text-[#FF8C42] hover:border-[#FF8C42] transition-all shadow-lg"
            title={isExpanded ? "Réduire" : "Étendre"}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </div>

        <Link href="/dashboard" className="flex items-center justify-center">
          <div className="relative w-20 h-16">
            <Image
              src="/logo/icon.png"
              alt="LearnSup"
              fill
              className="object-contain"
            />
          </div>
        </Link>

        <nav
          className={cn(
            "flex flex-col gap-6 flex-1 justify-center",
            isExpanded ? "items-stretch w-full" : "items-center"
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const hasBadge =
              item.showBadge && unreadCount && unreadCount.count > 0;

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "relative rounded-lg flex items-center gap-3 transition-all duration-200 ease-in-out group",
                  isExpanded ? "h-11 px-4 w-full" : "w-11 h-11 justify-center",
                  isActive
                    ? "text-[#FF8C42] bg-linear-to-br from-[#FF8C42]/15 to-[#FF8C42]/5 shadow-sm"
                    : "text-[#64748b] hover:text-[#FF8C42] hover:bg-linear-to-br hover:from-[#FF8C42]/10 hover:to-[#FF8C42]/5 hover:-translate-y-0.5 hover:shadow-md dark:text-gray-400 dark:hover:text-[#FF8C42]"
                )}
                title={isExpanded ? undefined : item.label}
              >
                <Icon
                  className={cn(
                    "transition-all duration-200 group-hover:scale-105",
                    isExpanded ? "w-5 h-5" : "w-6 h-6"
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {isExpanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {hasBadge && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      "h-5 min-w-5 flex items-center justify-center px-1.5 text-xs animate-pulse",
                      isExpanded ? "ml-auto" : "absolute -top-1 -right-1"
                    )}
                  >
                    {formatBadgeCount(unreadCount.count)}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/info"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "rounded-lg flex items-center gap-3 text-[#64748b] hover:text-[#FF8C42] hover:bg-linear-to-br hover:from-[#FF8C42]/10 hover:to-[#FF8C42]/5 hover:-translate-y-0.5 hover:shadow-md dark:text-gray-400 dark:hover:text-[#FF8C42] transition-all duration-200 ease-in-out group",
            isExpanded ? "h-11 px-4 w-full" : "w-11 h-11 justify-center"
          )}
          title={isExpanded ? undefined : "Informations"}
        >
          <Info
            className={cn(
              "transition-all duration-200 group-hover:scale-105",
              isExpanded ? "w-5 h-5" : "w-6 h-6"
            )}
            strokeWidth={1.5}
          />
          {isExpanded && (
            <span className="text-sm font-medium whitespace-nowrap">
              Informations
            </span>
          )}
        </Link>
      </aside>
    </>
  );
}
