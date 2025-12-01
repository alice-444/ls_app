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
      title="Reset Your Password"
      headerColor="#2563eb"
    >
      <Text>Hello,</Text>
      <Text>
        You requested to reset your password for your LearnSup account. Use the
        following code to reset it:
      </Text>
      <Section style={otpContainer}>
        <Text style={otpCode}>{otp}</Text>
      </Section>
      <Text>
        This code will expire in 10 minutes. If you did not request this reset,
        please ignore this email.
      </Text>
    </EmailLayout>
  );
}

const otpContainer = {
  backgroundColor: "#f1f5f9",
  padding: "20px",
  borderRadius: "8px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const otpCode = {
  color: "#2563eb",
  fontSize: "32px",
  letterSpacing: "8px",
  margin: "0",
  fontWeight: "bold",
};
