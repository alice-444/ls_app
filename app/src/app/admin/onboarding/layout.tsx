import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding admin | LearnSup",
  description: "Gérez les parcours d'onboarding des utilisateurs.",
};

export default function AdminOnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
