"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isLight = theme === "light";

  return (
    <div className="flex items-center p-1 rounded-full bg-white/30 dark:bg-white/15 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/30 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08),inset_0_2px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.15)]">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={cn(
          "h-8 w-8 rounded-full transition-colors",
          isLight
            ? "bg-[#FFB647] hover:bg-[#FFB647] text-white"
            : "hover:bg-transparent"
        )}
      >
        <Sun className="h-[18px] w-[18px]" />
        <span className="sr-only">Mode clair</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={cn(
          "h-8 w-8 rounded-full transition-colors",
          theme === "dark"
            ? "bg-[#FFB647] hover:bg-[#FFB647] text-white"
            : "hover:bg-transparent"
        )}
      >
        <Moon className="h-[18px] w-[18px]" />
        <span className="sr-only">Mode sombre</span>
      </Button>
    </div>
  );
}
