import type { Metadata } from "next";
import { Suspense } from "react";
import "../index.css";
import Providers from "@/components/shared/Providers";
import { RoleGate } from "@/components/shared/layout/RoleGate";
import { LayoutSwitch } from "@/components/shared/layout/LayoutSwitch";
import Loader from "@/components/shared/Loader";

export const metadata: Metadata = {
  title: {
    default: "LearnSup - Plateforme d'apprentissage solidaire",
    template: "%s | LearnSup",
  },
  description: "LearnSup est la plateforme d'apprentissage entre pairs où tu apprends avec des mentors et d'autres étudiant.e.s. Rejoins notre communauté solidaire !",
  keywords: ["apprentissage", "solidarité", "mentorat", "étudiants", "ateliers", "entraide", "LearnSup", "éducation", "formation", "partage de connaissances", "succès académique"],
  authors: [{ name: "LearnSup Team" }],
  creator: "LearnSup Team",
  publisher: "LearnSup",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://app.learnsup.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LearnSup - Plateforme d'apprentissage solidaire",
    description: "Apprends avec des mentors et d'autres étudiant.e.s sur LearnSup.",
    url: "https://app.learnsup.fr",
    siteName: "LearnSup",
    locale: "fr_FR",
    type: "website",
  },
  icons: {
    icon: "/ico_LearnSup.ico",
    shortcut: "/ico_LearnSup.ico",
    apple: "/ico_LearnSup.ico",
  },
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
