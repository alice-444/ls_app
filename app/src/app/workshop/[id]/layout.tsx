import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détails de l'Atelier",
  description: "Consulte le programme et inscris-toi à cet atelier d'apprentissage sur LearnSup.",
};

export default function WorkshopDetailsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
