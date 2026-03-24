import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Administration LearnSup",
  description: "Gérez les demandes de support LearnSup.",
};

export default function AdminSupportLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
