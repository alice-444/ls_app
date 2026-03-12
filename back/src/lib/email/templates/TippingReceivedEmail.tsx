import { Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface TippingReceivedEmailProps {
  readonly mentorName: string;
  readonly apprenticeName: string;
  readonly amount: number;
  readonly workshopTitle: string;
}

export function TippingReceivedEmail({
  mentorName,
  apprenticeName,
  amount,
  workshopTitle,
}: TippingReceivedEmailProps) {
  return (
    <EmailLayout
      preview={`Vous avez reçu ${amount} crédits de ${apprenticeName} !`}
      title="Un nouveau pourboire !"
    >
      <Text>Bonjour {mentorName},</Text>
      <Text>
        Bonne nouvelle ! <strong>{apprenticeName}</strong> vous a envoyé un pourboire de <strong>{amount} crédits</strong> pour votre atelier : <strong>{workshopTitle}</strong>.
      </Text>

      <Section style={creditBox}>
        <Text style={creditText}>+{amount} crédits</Text>
      </Section>

      <Text>
        C&apos;est une belle reconnaissance de la qualité de votre transmission. Ces crédits ont été ajoutés à votre solde et vous permettront de participer à d&apos;autres ateliers sur la plateforme.
      </Text>

      <Text style={footerNote}>
        Merci de contribuer à faire de LearnSup une communauté d&apos;apprentissage solidaire !
      </Text>
    </EmailLayout>
  );
}

const creditBox = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  padding: "30px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #bbf7d0",
};

const creditText = {
  margin: "0",
  fontSize: "36px",
  fontWeight: "bold",
  color: "#16a34a",
};

const footerNote = {
  fontSize: "14px",
  color: "#9ca3af",
  fontStyle: "italic" as const,
  marginTop: "32px",
};
