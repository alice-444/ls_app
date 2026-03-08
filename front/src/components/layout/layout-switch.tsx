"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { ScrollToTopButton } from "@/components/scroll-to-top-button";

export function LayoutSwitch({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const authOnlyPaths = ["/login", "/forgot-password", "/reset-password", "/onboarding"];
  if (authOnlyPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </div>
  );
}
