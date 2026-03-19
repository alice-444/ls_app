"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-server-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  LayoutDashboard,
  Calendar,
  PenTool,
  Users,
  UserCircle,
  HelpCircle,
  ChevronLeft,
  Menu,
  Search,
  UserPlus,
  MessageSquare,
  Bell,
  Globe,
  Info,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  key: string;
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ("MENTOR" | "APPRENANT" | "ADMIN")[];
}

interface SidebarProps {
  customItems?: { title: string; href: string; icon: LucideIcon }[];
  title?: string;
  icon?: LucideIcon;
}

const getNavItems = (
  role: "MENTOR" | "APPRENANT" | "ADMIN" | null
): NavItem[] => [
    {
      key: "/dashboard",
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      key: "/community",
      name: "Communauté",
      href: "/community",
      icon: Users,
    },
    // --- MENTOR SPACE ---
    {
      key: "/my-workshops",
      name: "Mes ateliers",
      href: "/my-workshops",
      icon: Calendar,
      roles: ["MENTOR"],
    },
    {
      key: "/workshop-editor",
      name: "Atelab",
      href: "/workshop-editor",
      icon: PenTool,
      roles: ["MENTOR"],
    },
    {
      key: "/mentor-profile",
      name: "Mon profil",
      href: "/mentor-profile",
      icon: UserCircle,
      roles: ["MENTOR"],
    },
    // --- APPRENANT SPACE ---
    {
      key: "/catalog",
      name: "Catalogue",
      href: "/catalog",
      icon: Search,
      roles: ["APPRENANT"],
    },
    {
      key: "/mentors",
      name: "Mentors",
      href: "/mentors",
      icon: UserPlus,
      roles: ["APPRENANT"],
    },
    {
      key: "/network",
      name: "Mon réseau",
      href: "/network",
      icon: Globe,
      roles: ["APPRENANT", "MENTOR"],
    },
    // --- COMMON ---
    {
      key: "/inbox",
      name: "Messages",
      href: "/inbox",
      icon: MessageSquare,
    },
    {
      key: "/notifications",
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      key: "/settings",
      name: "Paramètres",
      href: "/settings",
      icon: Settings,
    },
    {
      key: "/profil",
      name: "Profil",
      href: "/profil",
      icon: UserCircle,
      roles: ["APPRENANT", "ADMIN"],
    },
  ];

export default function Sidebar({ customItems, title, icon: TitleIcon }: Readonly<SidebarProps>) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const { isMobileOpen, setMobileOpen } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  if (!session) {
    return null;
  }

  if (pathname === "/login") {
    return null;
  }

  if (isLoadingRole) {
    return null;
  }

  const role = userRole ?? null;
  const navItems = customItems
    ? customItems.map(item => ({
      key: item.href,
      name: item.title,
      href: item.href,
      icon: item.icon,
      roles: undefined as ("MENTOR" | "APPRENANT" | "ADMIN")[] | undefined
    }))
    : getNavItems(role);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 w-full border-0 p-0 cursor-default bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed md:relative z-50 md:z-20 shrink-0 min-h-screen h-screen bg-card border-r-2 border-border shadow-2xl transition-all duration-300 w-full md:w-auto rounded-r-3xl md:mr-3 ${isExpanded ? "md:w-64" : "md:w-24"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          } flex flex-col`}
      >
        <div className="flex items-center justify-between h-20 px-4">
          <Link href="/" className="flex items-center gap-2 group">
            {TitleIcon ? (
              <TitleIcon className="h-8 w-8 text-brand shrink-0 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <Image
                src="/logo/icon.png"
                alt="LearnSup Logo"
                width={56}
                height={56}
                className="shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
            )}
            {isExpanded && (
              <span className="font-bold text-xl text-ls-heading whitespace-nowrap">
                {title || "LearnSup"}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-ls-heading hover:text-brand transition-colors ml-1 rounded-full p-2 hover:bg-brand/20"
          >
            {isExpanded ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-0 overflow-y-auto">
          {navItems
            .filter((item) => {
              if (!item.roles) return true;
              if (!role) return false;
              return item.roles.includes(role);
            })
            .map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/" && pathname.startsWith(item.href));
              return (
                <div key={item.key} className="relative group">
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-3 bg-brand rounded-r-full shadow-[0_0_12px_rgba(255,182,71,0.6)]" />
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center h-12 px-6 mx-2 rounded-xl transition-all duration-300 ${isActive
                      ? "text-brand font-bold bg-brand/20"
                      : "text-ls-heading hover:text-brand hover:bg-brand/15"
                      }`}
                  >
                    <item.icon className={`h-6 w-6 shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"}`} />
                    {isExpanded && <span className="ml-4 text-sm tracking-wide">{item.name}</span>}
                  </Link>
                </div>
              );
            })}

          {!customItems && (
            <div className="pt-4 mt-6 border-t-2 border-border">
              <Link
                href="/help"
                className={`flex items-center h-12 px-6 mx-2 rounded-xl transition-all duration-300 group ${pathname === "/help"
                  ? "text-brand font-bold bg-brand/20"
                  : "text-ls-heading hover:text-brand hover:bg-brand/15"
                  }`}
              >
                <HelpCircle className="h-6 w-6 shrink-0 transition-transform group-hover:rotate-12" />
                {isExpanded && <span className="ml-4 text-sm">Aide et support</span>}
              </Link>

              <Link
                href="/legal"
                className={`flex items-center h-12 px-6 mx-2 rounded-xl transition-all duration-300 group ${pathname === "/legal"
                  ? "text-brand font-bold bg-brand/20"
                  : "text-ls-heading hover:text-brand hover:bg-brand/15"
                  }`}
              >
                <Info className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110" />
                {isExpanded && <span className="ml-4 text-sm">Informations</span>}
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
