import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WorkshopRescheduledEmailProps {
  readonly userName: string;
  readonly workshopTitle: string;
  readonly oldDate: string;
  readonly oldTime: string;
  readonly newDate: string;
  readonly newTime: string;
  readonly workshopUrl: string;
}

export function WorkshopRescheduledEmail({
  userName,
  workshopTitle,
  oldDate,
  oldTime,
  newDate,
  newTime,
  workshopUrl,
}: WorkshopRescheduledEmailProps) {
  return (
    <EmailLayout
      title="Changement d'horaire pour votre atelier"
      preview={`L'atelier "${workshopTitle}" a été reprogrammé.`}
      headerColor="#3b82f6"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Nous vous informons que l'atelier <strong>{workshopTitle}</strong> a été reprogrammé par le mentor.
      </Text>
      
      <Section className="bg-red-50 rounded-lg p-4 my-4 border-l-4 border-red-500">
        <Text className="m-0 font-semibold text-red-700">Ancien horaire :</Text>
        <Text className="m-0 text-red-600">
          {oldDate} à {oldTime}
        </Text>
      </Section>

      <Section className="bg-blue-50 rounded-lg p-4 my-4 border-l-4 border-blue-500">
        <Text className="m-0 font-semibold text-blue-700">Nouvel horaire :</Text>
        <Text className="m-0 text-blue-600 font-bold text-lg">
          {newDate} à {newTime}
        </Text>
      </Section>

      <Text className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 italic">
        ⚠️ Votre participation est maintenue par défaut. Si le nouvel horaire ne vous convient pas, vous pouvez annuler votre inscription depuis les détails de l'atelier.
      </Text>

      <Section className="text-center mt-6">
        <Button
          href={workshopUrl}
          className="bg-[#3b82f6] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Voir les détails de l'atelier
        </Button>
      </Section>
    </EmailLayout>
  );
}
