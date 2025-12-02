import { Section, Text, Tailwind } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface PasswordChangeConfirmationProps {
  readonly userName?: string;
  readonly date: string;
  readonly time: string;
}

export function PasswordChangeConfirmation({
  userName,
  date,
  time,
}: PasswordChangeConfirmationProps) {
  return (
    <EmailLayout
      preview="Confirmation de changement de mot de passe"
      title="Mot de passe modifié"
      headerColor="#10b981"
    >
      <Tailwind>
        <>
          <Text className="font-semibold text-[24px] text-indigo-400 leading-[32px]">
            Votre mot de passe a été modifié avec succès
          </Text>
          <Text>Bonjour {userName || "Utilisateur"},</Text>
          <Text>
            Nous vous confirmons que le mot de passe de votre compte LearnSup a
            été modifié avec succès.
          </Text>
          <Section style={infoBox}>
            <Text style={infoTitle}>Détails de la modification :</Text>
            <Text style={infoText}>
              <strong>Date :</strong> {date}
            </Text>
            <Text style={infoText}>
              <strong>Heure :</strong> {time}
            </Text>
          </Section>
          <Text>
            <strong>Important :</strong> Si vous n&apos;avez pas effectué cette
            modification, veuillez contacter immédiatement notre équipe de
            support pour sécuriser votre compte.
          </Text>
          <Text>
            Pour des raisons de sécurité, toutes vos autres sessions ont été
            déconnectées. Vous devrez vous reconnecter avec votre nouveau mot de
            passe.
          </Text>
        </>
      </Tailwind>
    </EmailLayout>
  );
}

const infoBox = {
  backgroundColor: "#f1f5f9",
  padding: "15px",
  borderRadius: "5px",
  margin: "20px 0",
};

const infoTitle = {
  margin: "0 0 10px 0",
  fontWeight: "bold",
};

const infoText = {
  margin: "5px 0",
};
