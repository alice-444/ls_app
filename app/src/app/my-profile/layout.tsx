import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon profil | LearnSup",
  description: "Consultez et modifiez votre profil mentor sur LearnSup.",
};

export default function MyProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
