"use client";

import { type ReactNode } from "react";
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
      className={`bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[rgba(214,218,228,0.32)] rounded-[16px] shadow-lg ${className}`}
    >
      {(title || description) && (
        <CardHeader className={`pb-4 px-4 sm:px-6 ${headerClassName}`}>
          {title && (
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-[#26547c] dark:text-[#e6e6e6]">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-sm text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
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
