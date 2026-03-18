"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-server-client";
import { getUserRole } from "@/lib/api-client";
import Header from "@/components/shared/header";
import Sidebar from "@/components/shared/sidebar";
import { Footer } from "@/components/shared/footer";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";
import { ADMIN_NAV_ITEMS, ADMIN_SIDEBAR_TITLE, ADMIN_SIDEBAR_ICON } from "@/lib/admin-nav";

export function LayoutSwitch({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const authOnlyPaths = ["/login", "/forgot-password", "/reset-password", "/onboarding"];
  const useMinimalLayout = authOnlyPaths.includes(pathname) || pathname.startsWith("/admin");
  if (useMinimalLayout) {
    return <>{children}</>;
  }

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="flex min-h-screen relative">
      <Sidebar
        customItems={isAdmin ? ADMIN_NAV_ITEMS : undefined}
        title={isAdmin ? ADMIN_SIDEBAR_TITLE : undefined}
        icon={isAdmin ? ADMIN_SIDEBAR_ICON : undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">{children}</main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </div>
  );
}
