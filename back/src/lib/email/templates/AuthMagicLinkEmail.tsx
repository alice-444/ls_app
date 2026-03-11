import { Button, Link, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface AuthMagicLinkEmailProps {
  readonly url: string;
}

export function AuthMagicLinkEmail({ url }: AuthMagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Connectez-vous à votre compte LearnSup"
      title="Lien de connexion"
    >
      <Text>Bonjour,</Text>
      <Text>
        Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre compte <strong>LearnSup</strong>.
      </Text>

      <Section style={buttonContainer}>
        <Button
          href={url}
          style={button}
        >
          Se connecter à LearnSup
        </Button>
        <Text style={linkText}>
          Ou copiez-collez ce lien : <Link href={url} style={link}>{url}</Link>
        </Text>
      </Section>

      <Text style={footerNote}>
        Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
      </Text>
    </EmailLayout>
  );
}

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
