"use client";

import Link from "next/link";
import { Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function AboutSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Info className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          A propos de LearnSup
        </h2>
      </div>
      <p className="text-base text-ls-heading">
        Informations sur l&apos;application
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <p className="font-medium">Version</p>
          <p className="text-muted-foreground">1.0.0</p>
        </div>
        <div>
          <p className="font-medium">Dernière mise à jour</p>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          asChild
        >
          <Link href="/info">
            <Info className="h-4 w-4 mr-2" />
            Plus d&apos;informations
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          asChild
        >
          <Link href="/help">
            <HelpCircle className="h-4 w-4 mr-2" />
            Aide
          </Link>
        </Button>
      </div>
    </div>
  );
}
