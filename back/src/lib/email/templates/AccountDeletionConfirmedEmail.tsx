import { Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface AccountDeletionConfirmedEmailProps {
  readonly userName: string;
}

export function AccountDeletionConfirmedEmail({
  userName,
}: AccountDeletionConfirmedEmailProps) {
  return (
    <EmailLayout
      preview="Votre compte LearnSup a été supprimé définitivement"
      title="Confirmation de suppression"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Nous vous confirmons que votre compte <strong>LearnSup</strong> ainsi que l&apos;intégralité de vos données personnelles ont été définitivement supprimés de nos serveurs, conformément à votre demande.
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          Toutes vos informations de profil, vos historiques d&apos;ateliers, vos messages et vos transactions ont été effacés de manière irréversible.
        </Text>
      </Section>

      <Text>
        Nous sommes désolés de vous voir partir, mais nous respectons votre choix. Si vous souhaitez revenir parmi nous un jour, vous devrez créer un nouveau compte.
      </Text>

      <Text style={footerNote}>
        Bonne continuation dans vos futurs apprentissages.
      </Text>
    </EmailLayout>
  );
}

const infoBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #e5e7eb",
};

const infoText = {
  margin: "0",
  fontSize: "15px",
  color: "#4b5563",
  textAlign: "center" as const,
};

const footerNote = {
  fontSize: "14px",
  color: "#9ca3af",
  marginTop: "32px",
};
