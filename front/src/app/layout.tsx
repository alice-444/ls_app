import type { Metadata } from "next";
import { Suspense } from "react";
import "../index.css";
import Providers from "@/components/shared/providers";
import { RoleGate } from "@/components/shared/layout/role-gate";
import { LayoutSwitch } from "@/components/shared/layout/layout-switch";
import Loader from "@/components/shared/loader";

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
            <Suspense fallback={<Loader fullScreen size="lg" />}>
              <LayoutSwitch>{children}</LayoutSwitch>
            </Suspense>
          </RoleGate>
        </Providers>
      </body>
    </html>
  );
}
