import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface EmailChangeSecurityAlertProps {
  readonly currentEmail: string;
  readonly requestedNewEmail: string;
}

export function EmailChangeSecurityAlert({
  currentEmail,
  requestedNewEmail,
}: EmailChangeSecurityAlertProps) {
  return (
    <EmailLayout
      preview="Alerte de sécurité - Changement d'email"
      title="Security Alert"
      headerColor="#dc2626"
    >
      <Text>Hello,</Text>
      <Text>
        Someone requested to change the email address associated with your
        LearnSup account.
      </Text>
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Current email:</strong> {currentEmail}
        </Text>
        <Text style={infoText}>
          <strong>Requested new email:</strong> {requestedNewEmail}
        </Text>
      </Section>
      <Text>
        If this was you, please verify the change by clicking the link sent to
        your new email address.
      </Text>
      <Text>
        <strong>If this was NOT you:</strong> Please contact our support team
        immediately to secure your account.
      </Text>
    </EmailLayout>
  );
}

const infoBox = {
  backgroundColor: "#f1f5f9",
  padding: "15px",
  borderRadius: "5px",
  margin: "20px 0",
};

const infoText = {
  margin: "5px 0",
};
