import type { Metadata } from "next";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

export const metadata: Metadata = {
  title: "LearnSup",
  description:
    "LearnSup is a platform for learning and/or teaching between students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 bg-transparent">
              <Header />
              <main className="flex-1 overflow-auto">{children}</main>
              <Footer />
              <ScrollToTopButton />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
