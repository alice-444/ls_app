import {
  User,
  UserCircle,
  Ban,
  Bell,
  Settings as SettingsIcon,
  MessageSquare,
  Info,
  HelpCircle,
  Coins,
  Download,
} from "lucide-react";
import type { SidebarItem } from "@/components/layout";

export type SettingsSection =
  | "profil"
  | "informations-personnelles"
  | "utilisateurs-bloques"
  | "mes-credits"
  | "notifications"
  | "parametres-systeme"
  | "feedback"
  | "support-info"
  | "export-donnees";

export const SIDEBAR_ITEMS: ReadonlyArray<SidebarItem<SettingsSection>> = [
  { id: "profil", label: "Profil", icon: User },
  {
    id: "informations-personnelles",
    label: "Informations personnelles",
    icon: UserCircle,
  },
  { id: "utilisateurs-bloques", label: "Utilisateurs bloqués", icon: Ban },
  { id: "mes-credits", label: "Mes crédits", icon: Coins },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "parametres-systeme", label: "Paramètres système", icon: SettingsIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "support-info", label: "Support & Informations", icon: HelpCircle },
  { id: "export-donnees", label: "Export des données", icon: Download },
];
