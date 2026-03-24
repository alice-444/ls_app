import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
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
}[] = [
  { title: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { title: "Analyses", href: "/admin/analytics", icon: BarChart3 },
  { title: "Signalements", href: "/admin/user-reports", icon: AlertOctagon },
  { title: "Modération", href: "/admin/moderation", icon: MessageSquare },
  { title: "Utilisateurs", href: "/admin/users", icon: Users },
  { title: "Support", href: "/admin/support", icon: LifeBuoy },
  { title: "Communauté", href: "/admin/community", icon: Users },
  { title: "Paramètres", href: "/admin/settings", icon: Settings },
];

export const ADMIN_SIDEBAR_TITLE = "Admin Panel";
export const ADMIN_SIDEBAR_ICON = ShieldCheck;
