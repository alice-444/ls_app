import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales - LearnSup",
  description: "Informations légales concernant la plateforme LearnSup.",
};

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
