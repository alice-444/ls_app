import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communauté | Administration LearnSup",
  description: "Gérez la communauté et les événements LearnSup.",
};

export default function AdminCommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
