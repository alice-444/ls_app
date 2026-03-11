import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface PasswordResetEmailProps {
  readonly otp: string;
}

export function PasswordResetEmail({ otp }: PasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Réinitialisez votre mot de passe"
      title="Réinitialisation de mot de passe"
    >
      <Text>Bonjour,</Text>
      <Text>
        Vous avez demandé à réinitialiser le mot de passe de votre compte <strong>LearnSup</strong>.
        Utilisez le code suivant pour procéder au changement :
      </Text>
      <Section style={otpContainer}>
        <Text style={otpCode}>{otp}</Text>
      </Section>
      <Text style={expiryText}>
        Ce code expirera dans 10 minutes. Si vous n&apos;avez pas demandé cette réinitialisation,
        vous pouvez ignorer cet email en toute sécurité.
      </Text>
    </EmailLayout>
  );
}

const otpContainer = {
  backgroundColor: "#FFF9F0",
  padding: "30px",
  borderRadius: "8px",
  margin: "30px 0",
  textAlign: "center" as const,
  border: "1px solid #FFE4BC",
};

const otpCode = {
  color: "#FFB647",
  fontSize: "36px",
  letterSpacing: "10px",
  margin: "0",
  fontWeight: "bold",
};

const expiryText = {
  fontSize: "14px",
  color: "#9ca3af",
  fontStyle: "italic" as const,
};
