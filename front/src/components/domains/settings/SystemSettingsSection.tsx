"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Settings as SettingsIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SystemSettingsSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Paramètres système
        </h2>
      </div>
      <p className="text-base text-ls-heading">
        Personnalisez votre expérience utilisateur
      </p>

      <div className="space-y-6">
        {mounted && (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Mode sombre</Label>
              <p className="text-sm text-muted-foreground">
                Activer le thème sombre
              </p>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
