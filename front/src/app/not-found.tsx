import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="intro-bg-base absolute inset-0 -z-10" aria-hidden />

      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--primary-orange-dark) dark:text-(--primary-orange) mb-6 opacity-90">
          Erreur 404
        </p>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl bg-(--primary-orange)/15 dark:bg-(--primary-orange)/25 flex items-center justify-center">
            <FileQuestion className="w-12 h-12 text-(--primary-orange-dark) dark:text-(--primary-orange)" />
          </div>
        </div>

        <div className="inline-block rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] bg-(--primary-orange-dark) dark:bg-(--primary-orange) px-8 py-5 shadow-2xl shadow-(--primary-orange)/30 dark:shadow-(--primary-orange)/25 dark:ring-1 dark:ring-white/20 mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Page introuvable
          </h1>
        </div>

        <p className="text-base sm:text-lg text-muted-foreground dark:text-white/90 max-w-lg mx-auto leading-relaxed mb-10">
          La page que tu recherches n&apos;existe pas.{" "}
          Vérifie l&apos;URL ou retourne à l&apos;accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-(--primary-orange) text-white hover:bg-(--primary-orange-dark) dark:hover:bg-(--primary-orange) dark:hover:brightness-110 hover:shadow-xl hover:shadow-(--primary-orange)/40 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 text-base px-8 py-6 rounded-full"
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
