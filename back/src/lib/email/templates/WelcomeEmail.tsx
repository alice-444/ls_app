import { Button, Section, Text } from "@react-email/components";
import { EmailLayout } from "./EmailLayout";

interface WelcomeEmailProps {
  readonly name: string;
  readonly username: string;
  readonly email: string;
  readonly onboardingUrl: string;
}

export function WelcomeEmail({
  name,
  username,
  email,
  onboardingUrl,
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="Bienvenue sur LearnSup !"
      title="Bienvenue sur LearnSup !"
      headerColor="#2563eb"
    >
      <Text>Bonjour {name},</Text>
      <Text>
        Nous sommes ravis de vous accueillir sur LearnSup, la plateforme qui
        connecte les mentors et les apprentis pour des ateliers enrichissants.
      </Text>
      <Section style={infoBox}>
        <Text style={infoTitle}>Votre compte :</Text>
        <Text style={infoText}>
          Nom d&apos;utilisateur : <strong>{username}</strong>
        </Text>
        <Text style={infoText}>
          Email : <strong>{email}</strong>
        </Text>
      </Section>
      <Text>
        <strong>Prochaines étapes :</strong>
      </Text>
      <Text style={listItem}>
        1. Complétez votre profil pour que les autres utilisateurs puissent vous
        découvrir
      </Text>
      <Text style={listItem}>
        2. Choisissez votre rôle : Mentor ou Apprenti
      </Text>
      <Text style={listItem}>
        3. Explorez les ateliers disponibles ou créez le vôtre
      </Text>
      <Section style={buttonContainer}>
        <Button style={button} href={onboardingUrl}>
          Compléter mon profil
        </Button>
      </Section>
      <Text>
        Si vous avez des questions, n&apos;hésitez pas à nous contacter via le
        support.
      </Text>
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

const listItem = {
  margin: "5px 0",
  paddingLeft: "10px",
};

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
