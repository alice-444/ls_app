"use client";

import { useState } from "react";
import { SectionSidebar } from "@/components/shared/layout";
import { 
  UserCircle, 
  Bell, 
  Settings as SettingsIcon,
  Info
} from "lucide-react";
import {
  PersonalInformationSection,
  NotificationsSection,
  SystemSettingsSection,
  AboutSection,
} from "@/components/domains/Settings";

type AdminSettingsSection =
  | "informations-personnelles"
  | "notifications"
  | "parametres-systeme"
  | "a-propos";

const ADMIN_SIDEBAR_ITEMS = [
  {
    id: "informations-personnelles",
    label: "Compte & Sécurité",
    icon: UserCircle,
  },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "parametres-systeme", label: "Apparence", icon: SettingsIcon },
  { id: "a-propos", label: "À propos", icon: Info },
];

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState<AdminSettingsSection>(
    "informations-personnelles"
  );

  const sectionContent: Record<AdminSettingsSection, React.ReactNode> = {
    "informations-personnelles": <PersonalInformationSection />,
    notifications: <NotificationsSection />,
    "parametres-systeme": <SystemSettingsSection />,
    "a-propos": <AboutSection />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres Administrateur</h1>
        <p className="text-muted-foreground">Gérez vos accès et les préférences de l'interface.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <SectionSidebar
            items={ADMIN_SIDEBAR_ITEMS as any}
            activeSection={activeSection}
            onSelect={(id) => setActiveSection(id)}
          />
        </div>

        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 sm:p-8 shadow-sm">
            {sectionContent[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
}
