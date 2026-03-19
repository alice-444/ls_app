import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace mentor | LearnSup",
  description: "Gérez vos ateliers et votre activité de mentorat sur LearnSup.",
};

export default function MentorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
