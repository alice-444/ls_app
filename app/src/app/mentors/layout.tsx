import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Mentors - Experts en Apprentissage Solidaire",
  description: "Découvre notre réseau de mentors passionnés. Trouve l'expert qui t'accompagnera dans ton parcours d'apprentissage sur LearnSup.",
  openGraph: {
    title: "Nos Mentors | LearnSup",
    description: "Découvre notre réseau de mentors passionnés sur LearnSup.",
  },
};

export default function MentorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
