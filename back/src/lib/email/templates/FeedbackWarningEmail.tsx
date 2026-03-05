import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface FeedbackWarningEmailProps {
  readonly userName: string;
  readonly mentorName: string;
  readonly workshopTitle: string;
}

export function FeedbackWarningEmail({
  userName,
  mentorName,
  workshopTitle,
}: FeedbackWarningEmailProps) {
  return (
    <EmailLayout
      title="Avertissement officiel"
      preview="Votre avis a été signalé et examiné par notre équipe."
      headerColor="#dc2626"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Nous vous informons qu'un avis que vous avez laissé pour l'atelier <strong>"{workshopTitle}"</strong> avec {mentorName} a été signalé et examiné par notre équipe de modération.
      </Text>
      
      <Section className="bg-amber-50 rounded-lg p-4 my-4 border-l-4 border-amber-500">
        <Text className="m-0 font-bold text-amber-800">⚠️ Avertissement</Text>
        <Text className="mt-2 mb-0 text-amber-700">
          Votre avis a été jugé inapproprié et ne respecte pas nos règles de communauté. Nous vous rappelons que tous les avis doivent être respectueux et constructifs.
        </Text>
      </Section>

      <Section className="bg-gray-50 rounded-lg p-4 my-4">
        <Text className="m-0 font-semibold text-gray-700">Règles de la communauté :</Text>
        <ul className="mt-2 text-gray-600 text-sm">
          <li>Respectez les autres membres de la communauté</li>
          <li>Fournissez des avis constructifs et honnêtes</li>
          <li>Évitez les propos injurieux, discriminatoires ou diffamatoires</li>
          <li>Ne publiez pas de contenu spam ou trompeur</li>
        </ul>
      </Section>

      <Text>
        Nous vous encourageons à réfléchir à votre comportement et à respecter nos règles à l'avenir. En cas de récidive, des mesures supplémentaires pourront être prises.
      </Text>
    </EmailLayout>
  );
}
