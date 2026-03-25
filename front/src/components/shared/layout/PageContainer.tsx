"use client";

import type { ReactNode } from "react";

interface PageContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <div className="min-h-screen bg-background">
      <div
        className={`w-full max-w-[1127px] mx-auto py-8 px-6 sm:px-8 lg:px-12 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
