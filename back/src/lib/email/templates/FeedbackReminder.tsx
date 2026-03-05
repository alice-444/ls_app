import { Button, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface FeedbackReminderEmailProps {
  readonly userName: string;
  readonly workshopTitle: string;
  readonly feedbackUrl: string;
}

export function FeedbackReminderEmail({
  userName,
  workshopTitle,
  feedbackUrl,
}: FeedbackReminderEmailProps) {
  return (
    <EmailLayout
      title="Votre avis nous intéresse !"
      preview={`Comment s'est passé votre atelier "${workshopTitle}" ?`}
      headerColor="#FF8C42"
    >
      <Text>Bonjour {userName},</Text>
      <Text>
        Vous avez récemment participé à l'atelier <strong>{workshopTitle}</strong>. Nous espérons que cette expérience vous a été bénéfique !
      </Text>
      <Text>
        Pourriez-vous prendre une minute pour laisser un avis sur cet atelier ? Vos retours sont précieux pour aider les mentors à s'améliorer et pour guider les autres apprenants.
      </Text>
      <Section className="text-center mt-6">
        <Button
          href={feedbackUrl}
          className="bg-[#FF8C42] text-white px-6 py-3 rounded-full font-bold no-underline"
        >
          Donner mon avis
        </Button>
      </Section>
    </EmailLayout>
  );
}
