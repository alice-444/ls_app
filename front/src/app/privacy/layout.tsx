import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité - LearnSup",
  description: "Politique de confidentialité de la plateforme LearnSup.",
};

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
