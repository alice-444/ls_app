import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ShieldOff, Home, LogIn } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="intro-bg-base absolute inset-0 -z-10" aria-hidden />

      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#26547C] dark:text-[#4A90E2] mb-6 opacity-90">
          Erreur 403
        </p>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-[#26547C]/10 dark:bg-[#4A90E2]/20 flex items-center justify-center">
            <ShieldOff className="w-12 h-12 text-[#26547C] dark:text-[#4A90E2]" />
          </div>
        </div>

        <div className="inline-block rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] bg-[#26547C] dark:bg-[#4A90E2] px-8 py-5 shadow-2xl shadow-[#26547C]/30 dark:shadow-[#4A90E2]/25 dark:ring-1 dark:ring-white/20 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Accès refusé
          </h1>
        </div>

        <p className="text-base sm:text-lg text-muted-foreground dark:text-white/90 max-w-lg mx-auto leading-relaxed mb-10">
          Tu n&apos;as pas les permissions nécessaires pour accéder à cette
          page. Connecte-toi avec un compte autorisé ou retourne à
          l&apos;accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-[#26547C] text-white hover:bg-[#1e3f5f] dark:bg-[#4A90E2] dark:hover:bg-[#3a7fd4] hover:shadow-xl transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 text-base px-8 py-6 rounded-full"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Retour à l&apos;accueil
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-[#26547C] text-[#26547C] dark:border-[#4A90E2] dark:text-[#4A90E2] bg-transparent hover:bg-[#26547C]/10 dark:hover:bg-[#4A90E2]/20 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 text-base px-8 py-6 rounded-full font-semibold"
          >
            <Link href="/login?mode=signin">
              <LogIn className="mr-2 h-5 w-5" />
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
