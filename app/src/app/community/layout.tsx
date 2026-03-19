import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communauté | LearnSup",
  description: "Découvrez les événements et opportunités de la communauté LearnSup.",
};

export default function CommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
