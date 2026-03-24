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
  headerColor = "#FFB647",
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
              <strong>L&apos;équipe LearnSup</strong>
            </Text>
            <Text style={footerNote}>
              Cet email est envoyé automatiquement par LearnSup.
              <br />
              Merci de ne pas y répondre directement.
            </Text>
            <EmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  fontFamily: "'Omnes', 'Arial', sans-serif",
  backgroundColor: "#f9fafb",
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden" as const,
};

const header = {
  padding: "40px 20px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
};

const content = {
  padding: "40px 30px",
  lineHeight: "1.6",
  color: "#161616",
  fontSize: "16px",
};

const footer = {
  padding: "30px",
  backgroundColor: "#fcfcfc",
  borderTop: "1px solid #f1f1f1",
};

const footerText = {
  fontSize: "15px",
  color: "#26547C",
  margin: "0 0 20px 0",
};

const footerNote = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "20px 0 0 0",
  lineHeight: "1.5",
};
