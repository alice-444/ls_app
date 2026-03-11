import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes conversations | LearnSup",
  description: "Gérez vos conversations et messages sur LearnSup.",
};

export default function InboxLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
