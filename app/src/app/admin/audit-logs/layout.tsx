import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journaux d'audit | Administration LearnSup",
  description: "Consultez les journaux d'audit de la plateforme LearnSup.",
};

export default function AdminAuditLogsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
