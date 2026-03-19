import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface WorkshopRequestReceivedEmailProps {
  readonly mentorName: string;
  readonly apprenticeName: string;
  readonly workshopTitle: string;
  readonly viewRequestUrl: string;
}

export function WorkshopRequestReceivedEmail({
  mentorName,
  apprenticeName,
  workshopTitle,
  viewRequestUrl,
}: WorkshopRequestReceivedEmailProps) {
  return (
    <EmailLayout
      preview={`Nouvelle demande de participation de ${apprenticeName}`}
      title="Nouvelle demande d'atelier"
    >
      <Text>Bonjour {mentorName},</Text>
      <Text>
        Bonne nouvelle ! <strong>{apprenticeName}</strong> souhaite participer à votre atelier : <strong>{workshopTitle}</strong>.
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          Vous pouvez consulter le profil de l&apos;apprenant et répondre à sa demande (accepter ou refuser) depuis votre tableau de bord.
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button href={viewRequestUrl} style={button}>
          Voir la demande
        </Button>
      </Section>

      <Text style={footerNote}>
        Répondre rapidement aux demandes permet de maintenir un bon score de réactivité sur votre profil mentor.
      </Text>
    </EmailLayout>
  );
}

const infoBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const infoText = {
  margin: "0",
  fontSize: "15px",
  color: "#4b5563",
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

const footerNote = {
  fontSize: "13px",
  color: "#9ca3af",
  fontStyle: "italic" as const,
};
