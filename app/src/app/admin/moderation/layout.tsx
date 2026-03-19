import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modération | Administration LearnSup",
  description: "Modérez le contenu de la plateforme LearnSup.",
};

export default function AdminModerationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
