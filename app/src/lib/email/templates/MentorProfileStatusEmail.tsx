import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface MentorProfileStatusEmailProps {
  readonly userName: string;
  readonly isApproved: boolean;
  readonly reason?: string;
  readonly actionUrl: string;
}

export function MentorProfileStatusEmail({
  userName,
  isApproved,
  reason,
  actionUrl,
}: MentorProfileStatusEmailProps) {
  const title = isApproved ? "Félicitations ! Profil Mentor approuvé" : "Mise à jour de votre profil mentor requise";
  const preview = isApproved ? "Votre profil mentor a été validé" : "Votre demande de profil mentor a été refusée";

  return (
    <EmailLayout preview={preview} title={title}>
      <Text>Bonjour {userName},</Text>

      {isApproved ? (
        <>
          <Text>
            Votre profil mentor a été examiné et validé avec succès par notre équipe de modération.
          </Text>
          <Text>
            Vous pouvez désormais publier vos premiers ateliers et commencer à partager vos connaissances sur <strong>LearnSup</strong> !
          </Text>
        </>
      ) : (
        <>
          <Text>
            Votre demande d&apos;onboarding en tant que mentor a été examinée. Malheureusement, elle ne peut pas être acceptée en l&apos;état.
          </Text>
          {reason && (
            <Section style={reasonBox}>
              <Text style={reasonTitle}>Motif de la décision :</Text>
              <Text style={reasonText}>{reason}</Text>
            </Section>
          )}
          <Text>
            Nous vous invitons à mettre à jour votre profil en tenant compte de ces remarques pour une nouvelle demande de validation.
          </Text>
        </>
      )}

      <Section style={buttonContainer}>
        <Button href={actionUrl} style={button}>
          {isApproved ? "Accéder à mon tableau de bord" : "Mettre à jour mon profil"}
        </Button>
      </Section>
    </EmailLayout>
  );
}

const reasonBox = {
  backgroundColor: "#fff1f2",
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  border: "1px solid #fda4af",
};

const reasonTitle = {
  margin: "0 0 8px 0",
  fontWeight: "bold",
  color: "#e11d48",
};

const reasonText = {
  margin: "0",
  fontSize: "15px",
  color: "#4b5563",
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
