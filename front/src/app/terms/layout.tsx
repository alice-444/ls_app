import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU - LearnSup",
  description: "Conditions Générales d'Utilisation de la plateforme LearnSup.",
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
