import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon réseau | LearnSup",
  description: "Gérez tes connexions et demandes de mentorat sur LearnSup.",
};

export default function NetworkLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
