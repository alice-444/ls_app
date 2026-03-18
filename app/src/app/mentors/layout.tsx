import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Répertoire des mentors | LearnSup",
  description: "Découvrez les mentors disponibles et trouvez l'accompagnement qui vous correspond.",
};

export default function MentorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
