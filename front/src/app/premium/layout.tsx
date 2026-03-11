import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium | LearnSup",
  description: "Découvrez les avantages Premium LearnSup.",
};

export default function PremiumLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
