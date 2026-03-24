import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Méthode non autorisée | LearnSup",
  description: "Cette méthode de requête n'est pas autorisée.",
};

export default function MethodNotAllowedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
