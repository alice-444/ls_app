import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AuthMagicLinkEmailProps {
  readonly url: string;
}

export function AuthMagicLinkEmail({ url }: AuthMagicLinkEmailProps) {
  return (
    <EmailLayout
      preview="Connectez-vous à votre compte LearnSup"
      title="Lien de connexion"
      headerColor="#2563eb"
    >
      <Text>Bonjour,</Text>
      <Text>
        Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre compte LearnSup.
      </Text>

      <Section className="text-center my-8">
        <Button
          href={url}
          className="bg-[#2563eb] text-white px-8 py-3 rounded-md font-bold no-underline"
        >
          Se connecter à LearnSup
        </Button>
        <Text className="mt-4 text-xs text-gray-500">
          Ou copiez-collez ce lien : <Link href={url} className="text-[#2563eb] underline">{url}</Link>
        </Text>
      </Section>

      <Text className="text-sm text-gray-500 italic">
        Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
      </Text>
    </EmailLayout>
  );
}
