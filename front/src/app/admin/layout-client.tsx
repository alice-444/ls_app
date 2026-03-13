"use client";

import type { ReactNode } from "react";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, ADMIN_SIDEBAR_TITLE, ADMIN_SIDEBAR_ICON } from "@/lib/admin-nav";

export default function AdminLayoutClient({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex h-screen bg-ls-bg transition-colors duration-300">
      <Sidebar
        customItems={ADMIN_NAV_ITEMS}
        title={ADMIN_SIDEBAR_TITLE}
        icon={ADMIN_SIDEBAR_ICON}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />

        <main className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 transition-all duration-300"
        )}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
