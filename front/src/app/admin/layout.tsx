"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Users,
  AlertOctagon,
  MessageSquare,
  LifeBuoy,
  LayoutDashboard,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ADMIN_NAV_ITEMS = [
  {
    title: "Tableau de bord",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Signalements",
    href: "/admin/user-reports",
    icon: AlertOctagon,
  },
  {
    title: "Modération",
    href: "/admin/moderation",
    icon: MessageSquare,
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Support",
    href: "/admin/support",
    icon: LifeBuoy,
  },
  {
    title: "Communauté",
    href: "/admin/community",
    icon: Users,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isMobileOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-ls-bg transition-colors duration-300">
      <Sidebar customItems={ADMIN_NAV_ITEMS} title="Admin Panel" icon={ShieldCheck} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 transition-all duration-300"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
