import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tableau de bord | LearnSup",
  description: "Accédez à vos ateliers, demandes et statistiques sur LearnSup.",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
