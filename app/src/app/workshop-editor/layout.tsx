import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un atelier | LearnSup",
  description: "Créez et gérez vos ateliers sur la plateforme LearnSup.",
};

export default function WorkshopEditorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
