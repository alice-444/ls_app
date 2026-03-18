import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salle des ateliers | LearnSup",
  description: "Parcourez les ateliers disponibles et inscrivez-vous sur LearnSup.",
};

export default function WorkshopRoomLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
