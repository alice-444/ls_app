import type { Metadata } from "next";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";
import { RoleGate } from "@/components/layout/role-gate";

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
            <div className="flex min-h-screen relative">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-auto">{children}</main>
                <Footer />
                <ScrollToTopButton />
              </div>
            </div>
          </RoleGate>
        </Providers>
      </body>
    </html>
  );
}
