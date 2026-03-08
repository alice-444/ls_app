import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WorkshopCancelledEmailProps {
  readonly userName: string;
  readonly workshopTitle: string;
  readonly date: string;
  readonly time: string;
  readonly workshopsUrl: string;
  readonly cancelledByName?: string;
  readonly reason?: string;
}

export function WorkshopCancelledEmail({
  userName,
  workshopTitle,
  date,
  time,
  workshopsUrl,
  cancelledByName = "Le participant",
  reason,
}: WorkshopCancelledEmailProps) {
  return (
    <EmailLayout
      title="Participation annulée"
      preview={`${cancelledByName} a annulé sa participation à l'atelier "${workshopTitle}".`}
      headerColor="#dc2626"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Nous vous informons que <strong>{cancelledByName}</strong> a annulé sa participation à l'atelier suivant :
      </Text>
      
      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="m-0 font-semibold text-gray-700">Atelier :</Text>
        <Text className="m-0 text-gray-900 font-bold">{workshopTitle}</Text>
        <Text className="mt-2 mb-0 text-sm text-gray-600">
          Initialement prévu le {date} à {time}
        </Text>
      </Section>

      {reason && (
        <Section className="bg-yellow-50 rounded-lg p-4 my-4">
          <Text className="m-0 font-semibold text-yellow-700">Raison de l'annulation :</Text>
          <Text className="m-0 text-yellow-800 italic">{reason}</Text>
        </Section>
      )}

      <Text>
        Le créneau a été libéré et d'autres participants peuvent désormais s'inscrire si l'atelier est toujours maintenu.
      </Text>

      <Section className="text-center mt-6">
        <Button
          href={workshopsUrl}
          className="bg-[#dc2626] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Gérer mes ateliers
        </Button>
      </Section>
    </EmailLayout>
  );
}
