import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface EmailChangeVerificationProps {
  readonly verificationUrl: string;
  readonly tokenExpiryHours: number;
}

export function EmailChangeVerification({
  verificationUrl,
  tokenExpiryHours,
}: EmailChangeVerificationProps) {
  return (
    <EmailLayout
      preview="Vérifiez votre nouvelle adresse email"
      title="Verify Your New Email"
      headerColor="#2563eb"
    >
      <Text>Hello,</Text>
      <Text>
        You requested to change your email address on LearnSup. To complete this
        change, please click the button below:
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>
      <Text>Or copy and paste this link into your browser:</Text>
      <Link href={verificationUrl} style={link}>
        {verificationUrl}
      </Link>
      <Text>This link will expire in {tokenExpiryHours} hours.</Text>
      <Text>
        If you did not request this change, please ignore this email or contact
        support.
      </Text>
    </EmailLayout>
  );
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  padding: "12px 24px",
  textDecoration: "none",
  borderRadius: "5px",
  display: "inline-block",
  fontWeight: "bold",
};

const link = {
  wordBreak: "break-all" as const,
  color: "#2563eb",
  textDecoration: "underline",
};
