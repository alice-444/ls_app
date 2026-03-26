import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil du Mentor",
  description: "Découvre l'expertise et les ateliers de ce mentor sur LearnSup.",
};

export default function MentorProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
