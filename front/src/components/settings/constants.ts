import {
  User,
  UserCircle,
  Ban,
  Bell,
  Settings as SettingsIcon,
  MessageSquare,
  Info,
  HelpCircle,
} from "lucide-react";
import type { SidebarItem } from "@/components/layout";

export type SettingsSection =
  | "profil"
  | "informations-personnelles"
  | "utilisateurs-bloques"
  | "notifications"
  | "parametres-systeme"
  | "feedback"
  | "a-propos"
  | "centre-aide";

export const SIDEBAR_ITEMS: ReadonlyArray<SidebarItem<SettingsSection>> = [
  { id: "profil", label: "Profil", icon: User },
  {
    id: "informations-personnelles",
    label: "Informations personnelles",
    icon: UserCircle,
  },
  { id: "utilisateurs-bloques", label: "Utilisateurs bloqués", icon: Ban },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "parametres-systeme", label: "Paramètres système", icon: SettingsIcon },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "a-propos", label: "A propos de LearnSup", icon: Info },
  { id: "centre-aide", label: "Centre d'aide", icon: HelpCircle },
];
