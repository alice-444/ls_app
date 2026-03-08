import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AuthPasswordResetEmailProps {
  readonly url?: string;
  readonly otp?: string;
}

export function AuthPasswordResetEmail({
  url,
  otp,
}: AuthPasswordResetEmailProps) {
  return (
    <EmailLayout
      preview="Réinitialisez votre mot de passe LearnSup"
      title="Réinitialisation de mot de passe"
      headerColor="#2563eb"
    >
      <Text>Bonjour,</Text>
      <Text>
        Vous avez demandé la réinitialisation de votre mot de passe LearnSup. Veuillez utiliser le lien ou le code ci-dessous pour choisir un nouveau mot de passe.
      </Text>

      {otp && (
        <Section className="bg-gray-50 rounded-lg p-6 my-6 text-center">
          <Text className="m-0 text-sm text-gray-500 uppercase tracking-wider">Votre code de réinitialisation</Text>
          <Text className="m-2 text-3xl font-bold text-[#2563eb] tracking-[8px]">
            {otp}
          </Text>
          <Text className="m-0 text-xs text-gray-400">Ce code est valable pendant 10 minutes.</Text>
        </Section>
      )}

      {url && (
        <Section className="text-center my-8">
          <Button
            href={url}
            className="bg-[#2563eb] text-white px-8 py-3 rounded-md font-bold no-underline"
          >
            Réinitialiser mon mot de passe
          </Button>
          <Text className="mt-4 text-xs text-gray-500">
            Ou copiez-collez ce lien : <Link href={url} className="text-[#2563eb] underline">{url}</Link>
          </Text>
        </Section>
      )}

      <Text className="text-sm text-gray-500 italic">
        Ce lien/code est valable pendant 60 minutes. Si vous n'avez pas demandé de réinitialisation, vous pouvez ignorer cet email.
      </Text>
    </EmailLayout>
  );
}
