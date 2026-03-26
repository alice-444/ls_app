import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ - LearnSup",
  description: "Foire aux questions - Toutes vos réponses sur LearnSup.",
};

export default function FAQLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
