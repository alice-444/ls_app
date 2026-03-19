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
      title="Changement d'horaire"
      preview={`L'atelier "${workshopTitle}" a été reprogrammé.`}
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Nous vous informons que l&apos;atelier <strong>{workshopTitle}</strong> a été reprogrammé par le mentor.
      </Text>
      
      <Section style={oldTimeBox}>
        <Text style={label}>Ancien horaire :</Text>
        <Text style={oldTimeText}>
          <s>{oldDate} à {oldTime}</s>
        </Text>
      </Section>

      <Section style={newTimeBox}>
        <Text style={label}>Nouvel horaire :</Text>
        <Text style={newTimeText}>
          {newDate} à {newTime}
        </Text>
      </Section>

      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ Votre participation est maintenue par défaut. Si le nouvel horaire ne vous convient pas, vous pouvez annuler votre inscription depuis les détails de l&apos;atelier.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button
          href={workshopUrl}
          style={button}
        >
          Voir les détails de l&apos;atelier
        </Button>
      </Section>
    </EmailLayout>
  );
}

const oldTimeBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "4px solid #9ca3af",
};

const newTimeBox = {
  backgroundColor: "#FFF9F0",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: "4px solid #FFB647",
};

const label = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#4b5563",
};

const oldTimeText = {
  margin: "4px 0 0 0",
  color: "#6b7280",
};

const newTimeText = {
  margin: "4px 0 0 0",
  color: "#26547C",
  fontWeight: "bold",
  fontSize: "18px",
};

const warningBox = {
  backgroundColor: "#FEFCE8",
  padding: "12px",
  borderRadius: "8px",
  margin: "24px 0",
};

const warningText = {
  margin: "0",
  fontSize: "14px",
  color: "#854d0e",
  fontStyle: "italic" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#FFB647",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "30px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};
