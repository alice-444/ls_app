import type { Metadata } from "next";
import AdminLayoutClient from "./layout-client";

export const metadata: Metadata = {
  title: "Administration | LearnSup",
  description: "Interface d'administration de la plateforme LearnSup.",
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
