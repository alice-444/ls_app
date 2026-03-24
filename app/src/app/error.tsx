"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ServerCrash, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Readonly<ErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="intro-bg-base absolute inset-0 -z-10" aria-hidden />

      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-destructive mb-6 opacity-90">
          Erreur 500
        </p>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center">
            <ServerCrash className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="inline-block rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] bg-destructive px-8 py-5 shadow-2xl shadow-destructive/30 dark:ring-1 dark:ring-white/20 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Erreur serveur
          </h1>
        </div>

        <p className="text-base sm:text-lg text-muted-foreground dark:text-white/90 max-w-lg mx-auto leading-relaxed mb-10">
          Une erreur inattendue s&apos;est produite. Tu peux réessayer ou
          retourner à l&apos;accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={reset}
            size="lg"
            className="bg-destructive text-white hover:bg-destructive/90 hover:shadow-xl transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 text-base px-8 py-6 rounded-full"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Réessayer
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-destructive text-destructive bg-transparent hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 text-base px-8 py-6 rounded-full font-semibold"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Retour à l&apos;accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
