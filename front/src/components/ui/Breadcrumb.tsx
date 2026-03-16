"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`flex items-center gap-2 text-sm text-ls-muted ${className}`}
    >
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-ls-muted/60 shrink-0" aria-hidden />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-brand transition-colors truncate max-w-[150px] sm:max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-ls-heading font-medium truncate max-w-[150px] sm:max-w-[300px]" title={item.label}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
