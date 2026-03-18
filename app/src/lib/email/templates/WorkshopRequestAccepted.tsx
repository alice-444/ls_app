import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WorkshopRequestAcceptedEmailProps {
  readonly userName: string;
  readonly mentorName: string;
  readonly workshopTitle: string;
  readonly date: string;
  readonly time: string;
  readonly workshopUrl: string;
}

export function WorkshopRequestAcceptedEmail({
  userName,
  mentorName,
  workshopTitle,
  date,
  time,
  workshopUrl,
}: WorkshopRequestAcceptedEmailProps) {
  return (
    <EmailLayout
      title="Votre demande a été acceptée !"
      preview={`${mentorName} a accepté votre demande pour l'atelier "${workshopTitle}".`}
      headerColor="#10b981"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Bonne nouvelle ! <strong>{mentorName}</strong> a accepté votre demande de participation à l'atelier <strong>{workshopTitle}</strong>.
      </Text>
      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="m-0 text-center text-lg font-bold text-[#26547c]">
          Le {date} à {time}
        </Text>
      </Section>
      <Text>
        Vous pouvez maintenant accéder aux détails de l'atelier et rejoindre la visioconférence le moment venu.
      </Text>
      <Section className="text-center mt-6">
        <Button
          href={workshopUrl}
          className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Accéder à l'atelier
        </Button>
      </Section>
    </EmailLayout>
  );
}
