import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil mentor | LearnSup",
  description: "Complétez votre profil de mentor pour être visible dans le répertoire LearnSup.",
};

import { MentorGuard } from "@/components/admin/MentorGuard";

export default function MentorProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MentorGuard>{children}</MentorGuard>;
}
