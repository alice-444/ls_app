import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Paliers et Avantages",
  description: "Découvre comment ta progression sur LearnSup te permet de débloquer des avantages et de contribuer à la solidarité.",
};

export default function PaliersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
