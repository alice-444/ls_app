import { Button, Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "./EmailLayout";

interface AuthEmailVerificationProps {
  readonly url?: string;
  readonly otp?: string;
}

export function AuthEmailVerification({
  url,
  otp,
}: AuthEmailVerificationProps) {
  return (
    <EmailLayout
      preview="Vérifiez votre adresse email sur LearnSup"
      title="Vérification de votre compte"
      headerColor="#2563eb"
    >
      <Text>Bonjour,</Text>
      <Text>
        Bienvenue sur LearnSup ! Pour finaliser la création de votre compte ou valider votre adresse email, veuillez suivre les instructions ci-dessous.
      </Text>

      {otp && (
        <Section className="bg-gray-50 rounded-lg p-6 my-6 text-center">
          <Text className="m-0 text-sm text-gray-500 uppercase tracking-wider">Votre code de vérification</Text>
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
            Vérifier mon adresse email
          </Button>
          <Text className="mt-4 text-xs text-gray-500">
            Ou copiez-collez ce lien : <Link href={url} className="text-[#2563eb] underline">{url}</Link>
          </Text>
        </Section>
      )}

      <Text>
        Si vous n'avez pas demandé cette vérification, vous pouvez ignorer cet email en toute sécurité.
      </Text>
    </EmailLayout>
  );
}
