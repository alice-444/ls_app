import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil mentor | LearnSup",
  description: "Complétez votre profil de mentor pour être visible dans le répertoire LearnSup.",
};

export default function MentorProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
