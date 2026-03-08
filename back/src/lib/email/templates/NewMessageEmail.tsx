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
      headerColor="#26547c"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        <strong>{senderName}</strong> vous a envoyé un nouveau message sur LearnSup :
      </Text>
      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="m-0 italic text-gray-700">
          "{messagePreview}"
        </Text>
      </Section>
      <Section className="text-center mt-6">
        <Button
          href={inboxUrl}
          className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Répondre au message
        </Button>
      </Section>
    </EmailLayout>
  );
}
