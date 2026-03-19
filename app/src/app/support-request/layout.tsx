import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacter le support | LearnSup",
  description: "Envoyez une demande de support à l'équipe LearnSup.",
};

export default function SupportRequestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
