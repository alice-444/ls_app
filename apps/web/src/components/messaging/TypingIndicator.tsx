"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  userName?: string | null;
  className?: string;
}

export function TypingIndicator({ userName, className }: TypingIndicatorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      <div className="flex gap-1">
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]"></span>
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]"></span>
        <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]"></span>
      </div>
      <span>{userName || "Quelqu'un"} est en train d'écrire...</span>
    </div>
  );
}
