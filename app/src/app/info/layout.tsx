import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Informations - LearnSup",
  description: "À propos de LearnSup et informations utiles.",
};

export default function InfoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
