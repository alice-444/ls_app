import type { Metadata } from "next";
import "../index.css";
import Providers from "@/components/providers";
import { RoleGate } from "@/components/layout/role-gate";
import { LayoutSwitch } from "@/components/layout/layout-switch";

export const metadata: Metadata = {
  title: "Learning Solidarity",
  description: "Plateforme d'apprentissage solidaire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-[#0a0510] text-[#26547c] dark:text-[#e6e6e6] transition-colors duration-300">
        <Providers>
          <RoleGate>
            <LayoutSwitch>{children}</LayoutSwitch>
          </RoleGate>
        </Providers>
      </body>
    </html>
  );
}
