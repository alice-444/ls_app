import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vérification email | LearnSup",
  description: "Vérifiez votre nouvelle adresse email LearnSup.",
};

export default function VerifyEmailChangeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
