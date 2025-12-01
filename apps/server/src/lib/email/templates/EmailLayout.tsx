import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";
import { EmailFooter } from "./EmailFooter";
import { EmailHeader } from "./EmailHeader";

interface EmailLayoutProps {
  readonly preview?: string;
  readonly title: string;
  readonly children: React.ReactNode;
  readonly headerColor?: string;
}

export function EmailLayout({
  preview,
  title,
  children,
  headerColor = "#2563eb",
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />
          <Section style={{ ...header, backgroundColor: headerColor }}>
            <Heading style={headerTitle}>{title}</Heading>
          </Section>
          <Tailwind>
            <Section style={content}>{children}</Section>
          </Tailwind>
          <Section style={footer}>
            <Text style={footerText}>
              Cordialement,
              <br />
              L&apos;équipe LearnSup
            </Text>
            <Text style={footerNote}>
              Cet email est envoyé automatiquement, merci de ne pas y répondre.
            </Text>
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f6f9fc",
  padding: "20px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  maxWidth: "600px",
  margin: "0 auto",
};

const header = {
  padding: "20px",
  borderRadius: "8px 8px 0 0",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0",
};

const content = {
  padding: "20px",
  lineHeight: "1.6",
  color: "#333333",
};

const footer = {
  padding: "20px",
  borderTop: "1px solid #e5e7eb",
  marginTop: "30px",
};

const footerText = {
  fontSize: "14px",
  color: "#333333",
  margin: "0 0 10px 0",
};

const footerNote = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: "0",
};
