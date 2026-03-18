import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WorkshopRequestRejectedEmailProps {
  readonly userName: string;
  readonly mentorName: string;
  readonly workshopTitle: string;
  readonly reason?: string | null;
  readonly workshopsUrl: string;
}

export function WorkshopRequestRejectedEmail({
  userName,
  mentorName,
  workshopTitle,
  reason,
  workshopsUrl,
}: WorkshopRequestRejectedEmailProps) {
  return (
    <EmailLayout
      title="Mise à jour concernant ta demande"
      preview={`${mentorName} ne peut pas donner suite à ta demande pour "${workshopTitle}".`}
      headerColor="#ef4444"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Nous t'informons que <strong>{mentorName}</strong> ne pourra malheureusement pas donner suite à ta demande de participation à l'atelier <strong>{workshopTitle}</strong>.
      </Text>
      {reason && (
        <Section className="bg-gray-50 rounded-lg p-4 my-4 border-l-4 border-red-500">
          <Text className="m-0 italic text-gray-700">
            "{reason}"
          </Text>
        </Section>
      )}
      <Text>
        Ne te décourage pas ! De nombreux autres ateliers sont disponibles sur la plateforme.
      </Text>
      <Section className="text-center mt-6">
        <Button
          href={workshopsUrl}
          className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Découvrir d'autres ateliers
        </Button>
      </Section>
    </EmailLayout>
  );
}
