import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modération des retours | Administration LearnSup",
  description: "Modérez les retours utilisateurs sur LearnSup.",
};

export default function AdminFeedbackModerationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
