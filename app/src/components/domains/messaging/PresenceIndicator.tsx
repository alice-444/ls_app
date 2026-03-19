"use client";

import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PresenceIndicatorProps {
  isOnline: boolean;
  lastSeen?: Date | string | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function PresenceIndicator({
  isOnline,
  lastSeen,
  size = "sm",
  showText = false,
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5">
        <Circle
          className={cn(
            sizeClasses[size],
            "fill-green-500 text-green-500",
            "animate-pulse"
          )}
        />
        {showText && (
          <span className="text-xs text-muted-foreground">En ligne</span>
        )}
      </div>
    );
  }

  if (lastSeen) {
    const lastSeenDate = new Date(lastSeen);
    const timeAgo = formatDistanceToNow(lastSeenDate, {
      addSuffix: true,
      locale: fr,
    });

    return (
      <div className="flex items-center gap-1.5">
        <Circle
          className={cn(sizeClasses[size], "fill-gray-400 text-gray-400")}
        />
        {showText && (
          <span className="text-xs text-muted-foreground">Vu {timeAgo}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Circle
        className={cn(sizeClasses[size], "fill-gray-400 text-gray-400")}
      />
      {showText && (
        <span className="text-xs text-muted-foreground">Hors ligne</span>
      )}
    </div>
  );
}
