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
        Nous vous informons que <strong>{cancelledByName}</strong> a annulé sa participation à l&apos;atelier suivant :
      </Text>
      
      <Section style={workshopBox}>
        <Text style={label}>Atelier :</Text>
        <Text style={titleText}>{workshopTitle}</Text>
        <Text style={dateText}>
          Initialement prévu le {date} à {time}
        </Text>
      </Section>

      {reason && (
        <Section style={reasonBox}>
          <Text style={reasonLabel}>Raison de l&apos;annulation :</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}

      <Text>
        Le créneau a été libéré et d&apos;autres participants peuvent désormais s&apos;inscrire si l&apos;atelier est toujours maintenu.
      </Text>

      <Section style={buttonContainer}>
        <Button
          href={workshopsUrl}
          style={button}
        >
          Gérer mes ateliers
        </Button>
      </Section>
    </EmailLayout>
  );
}

const workshopBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const label = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#4b5563",
};

const titleText = {
  margin: "4px 0",
  fontSize: "18px",
  fontWeight: "bold",
  color: "#161616",
};

const dateText = {
  margin: "0",
  fontSize: "14px",
  color: "#6b7280",
};

const reasonBox = {
  backgroundColor: "#FEFCE8",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "4px solid #eab308",
};

const reasonLabel = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#854d0e",
};

const reasonText = {
  margin: "4px 0 0 0",
  fontStyle: "italic" as const,
  color: "#a16207",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "30px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};
