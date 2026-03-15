import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenir Premium",
  description: "Soutiens la plateforme et débloque des fonctionnalités exclusives avec LearnSup Premium.",
  openGraph: {
    title: "LearnSup Premium",
    description: "Accède au meilleur de l'apprentissage entre pairs.",
  },
};

export default function PremiumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
