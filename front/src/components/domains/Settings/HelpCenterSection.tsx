"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function HelpCenterSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-8 w-8 text-ls-heading" />
        <h2 className="text-2xl font-semibold text-ls-heading">
          Centre d&apos;aide
        </h2>
      </div>
      <p className="text-base text-ls-heading">
        Retrouvez l&apos;ensemble des informations sur l&apos;application
      </p>

      <div className="space-y-4">
        <Button variant="outline" className="w-full sm:w-auto" asChild>
          <Link href="/help">Accéder au centre d&apos;aide</Link>
        </Button>
      </div>
    </div>
  );
}
