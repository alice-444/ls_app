import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue des Ateliers - Apprends avec des Experts",
  description: "Parcoure notre catalogue d'ateliers en petit groupe. Apprends de nouvelles compétences avec des mentors expérimentés.",
  openGraph: {
    title: "Catalogue des Ateliers | LearnSup",
    description: "Découvre et inscris-toi à nos ateliers sur LearnSup.",
  },
};

export default function WorkshopRoomLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
