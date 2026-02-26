"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import { PageHeader, PageContainer, SectionSidebar } from "@/components/layout";
import { BlockedUsersSection } from "./BlockedUsersSection";
import { SIDEBAR_ITEMS, type SettingsSection } from "./constants";
import {
  AccountSection,
  PersonalInformationSection,
  NotificationsSection,
  SystemSettingsSection,
  FeedbackSection,
  AboutSection,
  HelpCenterSection,
} from "./components";

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
    notifications: <NotificationsSection />,
    "parametres-systeme": <SystemSettingsSection />,
    feedback: <FeedbackSection />,
    "a-propos": <AboutSection />,
    "centre-aide": <HelpCenterSection />,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Paramètres"
        subtitle="Gère tes préférences et paramètres de compte"
      />

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
        <SectionSidebar
          items={SIDEBAR_ITEMS}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="flex-1">
          <div className="bg-ls-surface border border-ls-border rounded-[10px] p-8">
            {sectionContent[activeSection]}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
