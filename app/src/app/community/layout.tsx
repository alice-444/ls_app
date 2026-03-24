import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communauté | LearnSup",
  description: "Rejoins une communauté dynamique d'étudiants et de mentors. Échanges, événements et entraide sur LearnSup.",
  openGraph: {
    title: "Communauté | LearnSup",
    description: "Découvre les événements et opportunités de la communauté LearnSup.",
  },
};

export default function CommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
