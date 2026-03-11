import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paliers | LearnSup",
  description: "Découvre les paliers et avantages LearnSup.",
};

export default function PaliersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
