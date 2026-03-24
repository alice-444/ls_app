import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paramètres | LearnSup",
  description: "Gérez vos paramètres de compte et préférences LearnSup.",
};

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
