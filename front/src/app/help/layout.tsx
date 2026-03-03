import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Centre d'aide - LearnSup",
  description: "Trouvez des réponses à vos questions sur LearnSup.",
};

export default function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
