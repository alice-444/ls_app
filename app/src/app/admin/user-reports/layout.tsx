import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signalements | Administration LearnSup",
  description: "Gérez les signalements utilisateurs sur LearnSup.",
};

export default function AdminUserReportsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
