"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  PenTool,
  Users,
  BookOpen,
  UserCircle,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface NavItem {
  key: string;
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: ("MENTOR" | "APPRENANT")[];
}

const getNavItems = (
  role: "MENTOR" | "APPRENANT" | null
): NavItem[] => [
  {
    key: "/dashboard",
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
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
    name: "Mon profil mentor",
    href: "/mentor-profile",
    icon: Users,
    roles: ["MENTOR"],
  },
  {
    key: "/workshop-room",
    name: "e-Atelier",
    href: "/workshop-room",
    icon: BookOpen,
    roles: ["APPRENANT"],
  },
  {
    key: "/profil",
    name: "Profil",
    href: "/profil",
    icon: UserCircle,
    roles: ["APPRENANT"],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSubNav, setActiveSubNav] = useState<string | null>(null);

  const { data: userRole, isLoading: isLoadingRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  // This is the definitive fix: Admins NEVER see the main sidebar.
  if (!session || userRole === "ADMIN") {
    return null;
  }
  
  // Also hide on login page.
  if (pathname === "/login") {
      return null;
  }

  // Wait for role to be loaded before rendering nav items
  if (isLoadingRole) {
    return null; // Or a sidebar skeleton
  }

  const navItems = getNavItems(userRole ?? null);

  const getSubNavItems = (key: string) => {
    switch (key) {
      case "/workshop-room":
        return [
          { name: "Live", href: "/workshop-room/live" },
          { name: "Replay", href: "/workshop-room/replay" },
          { name: "Prochains ateliers", href: "/workshop-room/upcoming" },
        ];
      default:
        return [];
    }
  };

  const handleSubNavToggle = (key: string) => {
    setActiveSubNav(activeSubNav === key ? null : key);
  };

  return (
    <>
      <aside
        className={`relative z-20 flex-shrink-0 bg-white dark:bg-[#1a1720] border-r border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] transition-all duration-300 ${
          isExpanded ? "w-64" : "w-20"
        } hidden md:flex flex-col`}
      >
        <div className="flex items-center justify-between h-20 px-6">
          <Link href="/" className="font-bold text-xl text-[#26547c] dark:text-[#e6e6e6]">
            {isExpanded ? "Learning Solidarity" : "LS"}
          </Link>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#26547c] dark:text-[#e6e6e6]">
            {isExpanded ? <X /> : <Menu />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems
            .filter((item) => {
              if (!item.roles) return true;
              return userRole ? item.roles.includes(userRole) : false;
            })
            .map((item) => (
              <div key={item.key}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (getSubNavItems(item.key).length > 0) {
                      e.preventDefault();
                      handleSubNavToggle(item.key);
                    }
                  }}
                  className={`flex items-center p-2 text-sm rounded-lg hover:bg-[#ffb647]/10 dark:hover:bg-[#ffb647]/20 transition-colors ${
                    pathname.startsWith(item.href)
                      ? "bg-[#ffb647]/20 dark:bg-[#ffb647]/30 text-[#26547c] dark:text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {isExpanded && <span className="ml-3">{item.name}</span>}
                  {isExpanded && getSubNavItems(item.key).length > 0 && (
                    <ChevronRight
                      className={`ml-auto h-4 w-4 transition-transform ${
                        activeSubNav === item.key ? "rotate-90" : ""
                      }`}
                    />
                  )}
                </Link>
                {isExpanded && activeSubNav === item.key && (
                  <div className="pl-10 mt-1 space-y-1">
                    {getSubNavItems(item.key).map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`block p-2 text-xs rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          pathname === subItem.href
                            ? "text-gray-900 dark:text-white font-semibold"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </nav>

        <Link
          href="/help"
          className="flex items-center p-4 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
        >
          <HelpCircle className="h-5 w-5" />
          {isExpanded && (
            <span className="ml-3 font-medium">Aide et support</span>
          )}
        </Link>

        <Link
          href="/legal"
          className="flex items-center p-4 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700"
        >
          <HelpCircle
            className="h-5 w-5"
            stroke="currentColor"
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
