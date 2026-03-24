import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos de nous",
  description: "Découvrez la mission de LearnSup et comment nous transformons l'apprentissage par la solidarité.",
  openGraph: {
    title: "À propos de LearnSup",
    description: "Apprenez-en plus sur notre vision et nos valeurs.",
  },
};

export default function InfoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
