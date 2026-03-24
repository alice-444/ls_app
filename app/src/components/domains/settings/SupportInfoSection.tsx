"use client";

import Link from "next/link";
import { Info, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function SupportInfoSection() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Support & Informations
        </h2>
      </div>

      <div className="space-y-6">
        <p className="text-base text-ls-heading">
          Besoin d'aide ou envie d'en savoir plus sur l'aventure LearnSup ?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm border-y border-ls-border py-6">
          <div>
            <p className="font-bold text-ls-heading">Version de l'application</p>
            <p className="text-ls-muted">1.0.0 (Stable)</p>
          </div>
          <div>
            <p className="font-bold text-ls-heading">Dernière mise à jour</p>
            <p className="text-ls-muted">
              {new Date().toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="cta" size="cta"
            asChild
          >
            <Link href="/help">
              <HelpCircle className="h-4 w-4 mr-2" />
              Centre d'aide & FAQ
            </Link>
          </Button>

          <Button
            variant="outline"
            className="rounded-full border-ls-border text-ls-heading hover:bg-ls-surface"
            asChild
          >
            <Link href="/legal">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Mentions Légales
            </Link>
          </Button>

          <Button
            variant="outline"
            className="rounded-full border-ls-border text-ls-heading hover:bg-ls-surface"
            asChild
          >
            <Link href="/info">
              <Info className="h-4 w-4 mr-2" />
              À propos de nous
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
