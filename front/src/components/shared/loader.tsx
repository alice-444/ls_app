"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  /** Full-screen centering (min-h-screen) for page loads */
  fullScreen?: boolean;
  /** Size: sm (modal), md (default), lg (page) */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 border-2",
  md: "h-12 w-12 border-[3px]",
  lg: "h-16 w-16 border-4",
} as const;

export default function Loader({
  fullScreen = false,
  size = "md",
  className,
}: Readonly<LoaderProps>) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "min-h-[50vh] sm:min-h-screen",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full border-2 border-border/50 border-t-brand animate-spin",
          "shadow-[0_0_20px_-4px_rgba(255,182,71,0.35)] dark:shadow-[0_0_24px_-4px_rgba(255,182,71,0.25)]",
          sizeClasses[size]
        )}
        aria-hidden
      />
    </div>
  );
}
