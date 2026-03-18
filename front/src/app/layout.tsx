import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "../index.css";
import Providers from "@/components/shared/providers";
import { RoleGate } from "@/components/shared/layout/RoleGate";
import { LayoutSwitch } from "@/components/shared/layout/LayoutSwitch";
import Loader from "@/components/shared/loader";
import React from "react";

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
        {process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID && (
          <Script id="clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID}");`}
          </Script>
        )}
      </body>
    </html>
  );
}
