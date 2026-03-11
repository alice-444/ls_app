import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acheter des crédits | LearnSup",
  description: "Rechargez votre compte en crédits pour participer aux ateliers LearnSup.",
};

export default function BuyCreditsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
