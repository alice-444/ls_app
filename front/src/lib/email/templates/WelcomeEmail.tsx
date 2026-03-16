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
    >
      <Text>Bonjour {name},</Text>
      <Text>
        Nous sommes ravis de vous accueillir sur <strong>LearnSup</strong>, la plateforme qui
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
      <Text style={subHeading}>
        <strong>Prochaines étapes :</strong>
      </Text>
      <Text style={listItem}>
        1. Complétez votre profil pour que les autres utilisateurs puissent vous
        découvrir.
      </Text>
      <Text style={listItem}>
        2. Choisissez votre rôle : Mentor ou Apprenti.
      </Text>
      <Text style={listItem}>
        3. Explorez les ateliers disponibles ou créez le vôtre !
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

const subHeading = {
  color: "#26547C",
  fontSize: "18px",
  margin: "20px 0 10px 0",
};

const infoBox = {
  backgroundColor: "#FFF9F0",
  padding: "20px",
  borderRadius: "8px",
  margin: "25px 0",
  border: "1px solid #FFE4BC",
};

const infoTitle = {
  margin: "0 0 10px 0",
  fontWeight: "bold",
  color: "#26547C",
};

const infoText = {
  margin: "5px 0",
  color: "#161616",
};

const listItem = {
  margin: "8px 0",
  paddingLeft: "10px",
  color: "#161616",
};

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
