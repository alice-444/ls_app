import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Administration LearnSup",
  description: "Gérez les notifications de la plateforme LearnSup.",
};

export default function AdminNotificationsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
