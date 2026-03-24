import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres | Administration LearnSup",
  description: "Gérez les paramètres de la plateforme LearnSup.",
};

export default function AdminSettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
