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
    <div className="flex items-center p-1 border border-[#d6dae4] dark:border-gray-700 rounded-full bg-white dark:bg-gray-950">
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
