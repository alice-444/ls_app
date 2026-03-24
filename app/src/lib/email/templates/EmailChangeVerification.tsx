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
      title="Vérifiez votre email"
    >
      <Text>Bonjour,</Text>
      <Text>
        Vous avez demandé à changer votre adresse email sur <strong>LearnSup</strong>. Pour valider ce
        changement, veuillez cliquer sur le bouton ci-dessous :
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Vérifier l&apos;adresse email
        </Button>
      </Section>
      <Text>Ou copiez et collez ce lien dans votre navigateur :</Text>
      <Link href={verificationUrl} style={link}>
        {verificationUrl}
      </Link>
      <Text style={expiryText}>Ce lien expirera dans {tokenExpiryHours} heures.</Text>
      <Text>
        Si vous n&apos;avez pas demandé ce changement, vous pouvez ignorer cet email en toute sécurité.
      </Text>
    </EmailLayout>
  );
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "35px 0",
};

const button = {
  backgroundColor: "#FFB647",
  color: "#ffffff",
  padding: "14px 28px",
  textDecoration: "none",
  borderRadius: "30px",
  display: "inline-block",
  fontWeight: "bold",
  fontSize: "16px",
};

const link = {
  wordBreak: "break-all" as const,
  color: "#FFB647",
  textDecoration: "underline",
  fontSize: "12px",
};

const expiryText = {
  fontSize: "14px",
  color: "#9ca3af",
  fontStyle: "italic" as const,
};
