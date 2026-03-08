"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  LayoutDashboard,
  Calendar,
  PenTool,
  Users,
  BookOpen,
  UserCircle,
  HelpCircle,
  ChevronLeft,
  Menu,
  Search,
  UserPlus,
  MessageSquare,
  Bell,
  Coins,
  Globe,
  Info,
  Settings,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

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
    key: "/workshops",
    name: "Catalogue",
    href: "/workshops",
    icon: Search,
    roles: ["APPRENANT"],
  },
  {
    key: "/workshop-room",
    name: "e-Atelier",
    href: "/workshop-room",
    icon: BookOpen,
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
  {
    key: "/buy-credits",
    name: "Mes crédits",
    href: "/buy-credits",
    icon: Coins,
    roles: ["APPRENANT", "MENTOR"],
  },
  // --- COMMON ---
  {
    key: "/community",
    name: "Communauté",
    href: "/community",
    icon: Users,
  },
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

export default function Sidebar({ customItems, title, icon: TitleIcon }: SidebarProps) {
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
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative z-50 md:z-20 flex-shrink-0 h-full bg-white dark:bg-[#1a1720] border-r border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] transition-all duration-300 ${
          isExpanded ? "w-64" : "w-20"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } flex flex-col`}
      >
        <div className="flex items-center justify-between h-20 px-4">
          <Link href="/" className="flex items-center gap-2 group">
            {TitleIcon ? (
              <TitleIcon className="h-8 w-8 text-brand shrink-0 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <Image
                src="/logo/logo.png"
                alt="LearnSup Logo"
                width={32}
                height={32}
                className="shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
            )}
            {isExpanded && (
              <span className="font-bold text-xl text-[#26547c] dark:text-[#e6e6e6] whitespace-nowrap">
                {title || "LearnSup"}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-[#26547c] dark:text-[#e6e6e6] hover:text-[#ffb647] transition-colors ml-1"
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
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ffb647] rounded-r-full shadow-[0_0_10px_rgba(255,182,71,0.5)]" />
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center h-12 px-6 transition-all duration-300 ${
                      isActive
                        ? "text-[#ffb647] font-bold bg-[#ffb647]/5"
                        : "text-gray-500 dark:text-gray-400 hover:text-[#ffb647] hover:pl-8"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"}`} />
                    {isExpanded && <span className="ml-4 text-sm tracking-wide">{item.name}</span>}
                  </Link>
                </div>
              );
            })}

          {!customItems && (
            <div className="pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
              <Link
                href="/help"
                className={`flex items-center h-12 px-6 transition-all duration-300 group ${
                  pathname === "/help" 
                    ? "text-[#26547c] font-bold bg-gray-50 dark:bg-gray-800/20" 
                    : "text-gray-400 hover:text-[#26547c] hover:pl-8"
                }`}
              >
                <HelpCircle className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-12" />
                {isExpanded && <span className="ml-4 text-sm">Aide et support</span>}
              </Link>

              <Link
                href="/legal"
                className={`flex items-center h-12 px-6 transition-all duration-300 group ${
                  pathname === "/legal" 
                    ? "text-[#26547c] font-bold bg-gray-50 dark:bg-gray-800/20" 
                    : "text-gray-400 hover:text-[#26547c] hover:pl-8"
                }`}
              >
                <Info className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                {isExpanded && <span className="ml-4 text-sm">Informations</span>}
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
