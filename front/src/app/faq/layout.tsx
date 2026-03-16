import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foire Aux Questions",
  description: "Toutes les réponses à vos questions sur le fonctionnement de LearnSup, les ateliers et le mentorat.",
  openGraph: {
    title: "FAQ | LearnSup",
    description: "Besoin d'aide ? Consultez notre foire aux questions.",
  },
};

export default function FAQLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
