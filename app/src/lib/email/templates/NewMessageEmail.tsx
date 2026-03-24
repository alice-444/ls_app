import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface NewMessageEmailProps {
  readonly userName: string;
  readonly senderName: string;
  readonly messagePreview: string;
  readonly inboxUrl: string;
}

export function NewMessageEmail({
  userName,
  senderName,
  messagePreview,
  inboxUrl,
}: NewMessageEmailProps) {
  return (
    <EmailLayout
      title="Nouveau message reçu"
      preview={`Vous avez reçu un nouveau message de ${senderName}.`}
      headerColor="#26547C"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        <strong>{senderName}</strong> vous a envoyé un nouveau message sur <strong>LearnSup</strong> :
      </Text>
      <Section style={messageBox}>
        <Text style={messageText}>
          &quot;{messagePreview}&quot;
        </Text>
      </Section>
      <Section style={buttonContainer}>
        <Button
          href={inboxUrl}
          style={button}
        >
          Répondre au message
        </Button>
      </Section>
    </EmailLayout>
  );
}

const messageBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: "4px solid #FFB647",
};

const messageText = {
  margin: "0",
  fontStyle: "italic" as const,
  color: "#4b5563",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#FF8C42",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "30px",
  fontWeight: "bold",
  textDecoration: "none",
  display: "inline-block",
};
