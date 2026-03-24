import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil apprenti | LearnSup",
  description: "Personnalisez votre profil d'apprenti sur LearnSup.",
};

export default function ProfilLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
