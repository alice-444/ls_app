import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding | LearnSup",
  description: "Choisisse ton rôle et complète ton profil LearnSup.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
