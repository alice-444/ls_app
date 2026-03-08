import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WorkshopReminderEmailProps {
  readonly userName: string;
  readonly workshopTitle: string;
  readonly date: string;
  readonly time: string;
  readonly workshopUrl: string;
}

export function WorkshopReminderEmail({
  userName,
  workshopTitle,
  date,
  time,
  workshopUrl,
}: WorkshopReminderEmailProps) {
  return (
    <EmailLayout
      title="Rappel : Votre atelier commence bientôt !"
      preview={`N'oubliez pas votre atelier "${workshopTitle}" demain.`}
      headerColor="#FF8C42"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Ceci est un petit rappel pour votre atelier <strong>{workshopTitle}</strong> qui aura lieu le :
      </Text>
      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="m-0 text-center text-lg font-bold text-[#26547c]">
          {date} à {time}
        </Text>
      </Section>
      <Text>
        Préparez vos questions et votre matériel si nécessaire. Nous avons hâte de vous y voir !
      </Text>
      <Section className="text-center mt-6">
        <Button
          href={workshopUrl}
          className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Voir les détails de l'atelier
        </Button>
      </Section>
    </EmailLayout>
  );
}
