"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { PageContainer, SectionSidebar } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { BlockedUsersSection } from "@/components/settings/BlockedUsersSection";
import { CreditsHistorySection } from "@/components/settings/CreditsHistorySection";
import { SIDEBAR_ITEMS } from "@/components/settings/constants";
import type { SettingsSection } from "@/components/settings/constants";
import {
  AccountSection,
  PersonalInformationSection,
  NotificationsSection,
  SystemSettingsSection,
  FeedbackSection,
  SupportInfoSection,
  ExportDataSection,
} from "@/components/settings";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const { data: profileData } = trpc.user.getProfile.useQuery();
  const [activeSection, setActiveSection] = useState<SettingsSection>(
    "informations-personnelles"
  );
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail.section as SettingsSection);
    };

    globalThis.addEventListener(
      "settings:change-section",
      handleSectionChange as EventListener
    );

    return () => {
      globalThis.removeEventListener(
        "settings:change-section",
        handleSectionChange as EventListener
      );
    };
  }, []);

  const sectionContent: Record<SettingsSection, React.ReactNode> = {
    profil: (
      <AccountSection
        session={session}
        profileData={profileData}
        privacyMode={privacyMode}
        setPrivacyMode={setPrivacyMode}
      />
    ),
    "informations-personnelles": <PersonalInformationSection />,
    "utilisateurs-bloques": <BlockedUsersSection />,
    "mes-credits": <CreditsHistorySection />,
    notifications: <NotificationsSection />,
    "parametres-systeme": <SystemSettingsSection />,
    feedback: <FeedbackSection />,
    "support-info": <SupportInfoSection />,
    "export-donnees": <ExportDataSection />,
  };

  return (
    <PageContainer>
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Paramètres" />
        </h1>
        <p className="text-base sm:text-lg text-ls-muted mt-2">
          Gère tes préférences et paramètres de compte
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col lg:flex-row gap-0 lg:gap-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <SectionSidebar
          items={SIDEBAR_ITEMS}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="flex-1">
          <div className="border border-border/50 bg-card/95 backdrop-blur-md rounded-2xl p-8 shadow-xl">
            {sectionContent[activeSection]}
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}
