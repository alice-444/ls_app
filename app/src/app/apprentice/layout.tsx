import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil apprenti | LearnSup",
  description: "Consultez le profil d'un apprenti sur LearnSup.",
};

export default function ApprenticeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
