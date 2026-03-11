import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium | LearnSup",
  description: "Découvre les avantages Premium LearnSup.",
};

export default function PremiumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
