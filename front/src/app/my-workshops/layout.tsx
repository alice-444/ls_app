import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes ateliers | LearnSup",
  description: "Gérez vos ateliers en tant que mentor sur LearnSup.",
};

export default function MyWorkshopsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
