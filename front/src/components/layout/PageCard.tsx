"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageCardProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly className?: string;
  readonly headerClassName?: string;
  readonly contentClassName?: string;
}

export function PageCard({
  children,
  title,
  description,
  className = "",
  headerClassName = "",
  contentClassName = "",
}: PageCardProps) {
  return (
    <Card
      className={`bg-ls-surface border border-ls-border rounded-[16px] shadow-lg ${className}`}
    >
      {(title || description) && (
        <CardHeader className={`pb-4 px-4 sm:px-6 ${headerClassName}`}>
          {title && (
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-ls-heading">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-ls-muted">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={`px-4 sm:px-6 pb-6 ${contentClassName}`}>
        {children}
      </CardContent>
    </Card>
  );
}
