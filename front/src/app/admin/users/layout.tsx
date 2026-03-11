import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utilisateurs | Administration LearnSup",
  description: "Gérez les utilisateurs de la plateforme LearnSup.",
};

export default function AdminUsersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
