import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acheter des Crédits",
  description: "Soutiens le projet et participe à des ateliers en rechargeant ton compte en Graines de Savoir.",
};

export default function BuyCreditsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
