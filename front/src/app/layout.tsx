import type { Metadata } from "next";
import "../index.css";
import Providers from "@/components/providers";
import Header from "@/components/header";

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
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
