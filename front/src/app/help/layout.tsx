import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centre d'Aide",
  description: "Trouvez des guides et des ressources pour bien utiliser la plateforme LearnSup.",
  openGraph: {
    title: "Centre d'Aide | LearnSup",
    description: "Besoin d'assistance ? Notre centre d'aide est là pour vous.",
  },
};

export default function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
