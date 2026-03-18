import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AuthPasswordResetEmailProps {
  readonly url?: string;
  readonly otp?: string;
}

export function AuthPasswordResetEmail({
  url,
  otp,
}: AuthPasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Réinitialise ton mot de passe LearnSup"
      title="Réinitialisation de mot de passe"
    >
      <Text>Bonjour,</Text>
      <Text>
        Tu as demandé la réinitialisation de ton mot de passe <strong>LearnSup</strong>. Utilise le lien ou le code ci-dessous pour choisir un nouveau mot de passe.
      </Text>

      {otp && (
        <Section style={codeBox}>
          <Text style={codeLabel}>Ton code de réinitialisation</Text>
          <Text style={codeText}>
            {otp}
          </Text>
          <Text style={codeExpiry}>Ce code est valable pendant 10 minutes.</Text>
        </Section>
      )}

      {url && (
        <Section style={buttonContainer}>
          <Button
            href={url}
            style={button}
          >
            Réinitialiser mon mot de passe
          </Button>
          <Text style={linkText}>
            Ou copie-colle ce lien : <Link href={url} style={link}>{url}</Link>
          </Text>
        </Section>
      )}

      <Text style={footerNote}>
        Ce lien/code est valable pour une durée limitée. Si tu n'as pas demandé de réinitialisation, tu peux ignorer cet email en toute sécurité.
      </Text>
    </EmailLayout>
  );
}

const codeBox = {
  backgroundColor: "#FFF9F0",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #FFE4BC",
};

const codeLabel = {
  margin: "0",
  fontSize: "14px",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const codeText = {
  margin: "10px 0",
  fontSize: "32px",
  fontWeight: "bold",
  color: "#FFB647",
  letterSpacing: "8px",
};

const codeExpiry = {
  margin: "0",
  fontSize: "12px",
  color: "#9ca3af",
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

const linkText = {
  marginTop: "16px",
  fontSize: "12px",
  color: "#9ca3af",
};

const link = {
  color: "#FFB647",
  textDecoration: "underline",
};

const footerNote = {
  fontSize: "14px",
  color: "#9ca3af",
  fontStyle: "italic" as const,
};
