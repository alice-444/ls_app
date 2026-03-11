import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface SupportRequestConfirmationProps {
  readonly subject: string;
  readonly problemType: string;
  readonly requestId: string;
  readonly hasAttachments: boolean;
  readonly attachmentCount?: number;
}

export function SupportRequestConfirmation({
  subject,
  problemType,
  requestId,
  hasAttachments,
  attachmentCount = 0,
}: SupportRequestConfirmationProps) {
  return (
    <EmailLayout
      preview="Confirmation de votre demande de support"
      title="Confirmation de votre demande"
    >
      <Text>Bonjour,</Text>
      <Text>
        Nous avons bien reçu votre demande de support concernant :{" "}
        <strong>{subject}</strong>
      </Text>
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Type de problème :</strong> {problemType}
        </Text>
        <Text style={infoText}>
          <strong>Numéro de demande :</strong> {requestId}
        </Text>
        {hasAttachments && (
          <Text style={infoText}>
            <strong>Pièces jointes :</strong> {attachmentCount} fichier
            {attachmentCount > 1 ? "s" : ""}
          </Text>
        )}
      </Section>
      <Text>
        Notre équipe va examiner votre demande et vous répondra dans les plus
        brefs délais.
      </Text>
      {hasAttachments && (
        <Text>
          Nous avons bien reçu vos pièces jointes et elles seront prises en
          compte dans l&apos;analyse de votre demande.
        </Text>
      )}
    </EmailLayout>
  );
}

const infoBox = {
  backgroundColor: "#FFF9F0",
  padding: "20px",
  borderRadius: "8px",
  margin: "25px 0",
  border: "1px solid #FFE4BC",
};

const infoText = {
  margin: "5px 0",
  color: "#161616",
};
