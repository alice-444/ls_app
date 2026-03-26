import type { LucideIcon } from "lucide-react";
import {
  Users,
  AlertOctagon,
  MessageSquare,
  LifeBuoy,
  LayoutDashboard,
  Settings,
  BarChart3,
} from "lucide-react";

export const ADMIN_NAV_ITEMS: {
  title: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: string;
  badgeColor?: string;
}[] = [
  { title: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { title: "Analyses", href: "/admin/analytics", icon: BarChart3 },
  {
    title: "Signalements",
    href: "/admin/user-reports",
    icon: AlertOctagon,
    badgeKey: "reports",
    badgeColor: "bg-red-500",
  },
  {
    title: "Modération",
    href: "/admin/moderation",
    icon: MessageSquare,
    badgeKey: "moderation",
    badgeColor: "bg-orange-500",
  },
  { title: "Utilisateurs", href: "/admin/users", icon: Users },
  {
    title: "Support",
    href: "/admin/support",
    icon: LifeBuoy,
    badgeKey: "support",
    badgeColor: "bg-blue-500",
  },
  {
    title: "Communauté",
    href: "/admin/community",
    icon: Users,
    badgeKey: "proposals",
    badgeColor: "bg-emerald-500",
  },
  { title: "Paramètres", href: "/admin/settings", icon: Settings },
];

export const ADMIN_SIDEBAR_TITLE = "Admin Panel";
export { ShieldCheck as ADMIN_SIDEBAR_ICON } from "lucide-react";
