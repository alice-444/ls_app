import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface UserDataExportEmailProps {
  readonly userName: string;
  readonly downloadUrl: string;
  readonly expiresAt: string;
}

export function UserDataExportEmail({
  userName,
  downloadUrl,
  expiresAt,
}: UserDataExportEmailProps) {
  return (
    <EmailLayout
      preview="Votre export de données personnelles LearnSup est prêt"
      title="Export de vos données"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Conformément à votre demande et dans le respect du RGPD, nous avons préparé l&apos;export de l&apos;intégralité de vos données personnelles liées à votre compte <strong>LearnSup</strong>.
      </Text>
      <Text>
        Vous pouvez télécharger votre archive (au format JSON) en cliquant sur le bouton ci-dessous :
      </Text>

      <Section style={buttonContainer}>
        <Button
          href={downloadUrl}
          style={button}
        >
          Télécharger mes données
        </Button>
      </Section>

      <Text style={warningText}>
        <strong>Attention :</strong> Ce lien est strictement personnel et expirera le <strong>{expiresAt}</strong>.
        Pour votre sécurité, nous vous recommandons de ne pas partager ce fichier.
      </Text>

      <Text style={infoText}>
        Cet export contient vos informations de profil, vos historiques d&apos;ateliers, vos messages et vos transactions de crédits.
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

const warningText = {
  fontSize: "14px",
  color: "#e11d48",
  backgroundColor: "#fff1f2",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #fda4af",
  margin: "24px 0",
};

const infoText = {
  fontSize: "14px",
  color: "#6b7280",
  fontStyle: "italic" as const,
};
