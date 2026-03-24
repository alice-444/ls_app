import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atelier | LearnSup",
  description: "Découvrez et participez aux ateliers d'apprentissage solidaire.",
};

export default function WorkshopLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
