"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";
import {
  Users,
  BookOpen,
  Trophy,
  ChevronRight,
  LogIn,
} from "lucide-react";

const highlights = [
  {
    icon: BookOpen,
    label: "Ateliers",
    desc: "En petit groupe",
  },
  {
    icon: Users,
    label: "Mentors",
    desc: "Étudiant.e.s passionné.e.s",
  },
];

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const getDashboardHref = () => {
    if (userRole === "ADMIN") {
      return "/admin";
    }
    return "/dashboard";
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="intro-bg-base absolute inset-0 -z-10" aria-hidden />

      <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-24">
        {/* En-tête */}
        <header className="text-center mb-12 sm:mb-16">
          <p className="intro-animate-1 text-xs sm:text-sm font-semibold uppercase tracking-[0.22em] text-(--primary-orange-dark) dark:text-(--primary-orange) mb-6 opacity-90">
            Apprentissage entre pairs
          </p>
          <div className="intro-animate-3 inline-block rounded-tl-[32px] rounded-br-[32px] rounded-tr-[8px] rounded-bl-[8px] bg-(--primary-orange-dark) dark:bg-(--primary-orange) px-8 sm:px-10 py-5 sm:py-6 shadow-2xl shadow-(--primary-orange)/30 dark:shadow-(--primary-orange)/25 dark:ring-1 dark:ring-white/20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Bienvenue sur LearnSup
            </h1>
          </div>
          <p className="intro-animate-4 mt-8 text-base sm:text-lg md:text-xl text-muted-foreground dark:text-white/90 max-w-2xl mx-auto leading-relaxed text-balance">
            La plateforme où tu apprends avec des mentors et d’autres étudiant.e.s.{" "}
            <span className="font-semibold text-(--primary-orange-dark) dark:text-(--primary-orange)">
              Connecte-toi
            </span>{" "}
            pour accéder à ton tableau de bord et rejoindre tes ateliers.
          </p>
        </header>

        {/* Pills valeur */}
        <div className="intro-animate-4 flex flex-wrap justify-center gap-4 sm:gap-5 mb-12">
          {highlights.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group flex items-center gap-3 rounded-full border-2 border-border bg-card/90 dark:bg-card dark:border-white/15 px-5 py-4 shadow-md hover:shadow-lg hover:border-(--primary-orange)/30 dark:hover:border-(--primary-orange)/50 transition-all duration-200"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--primary-orange)/15 dark:bg-(--primary-orange)/25 text-(--primary-orange)">
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="block font-semibold text-foreground">
                  {label}
                </span>
                <span className="block text-sm text-muted-foreground">{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Zone CTA */}
        <div className="text-center">
          {!isPending && (
            <>
              <p className="text-lg sm:text-xl font-medium text-muted-foreground mb-6 dark:text-white">
                {session
                  ? "Tu es connecté(e). Accède à ton espace."
                  : "Rejoins la plateforme en quelques clics."}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                {session ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-(--primary-orange) text-white hover:bg-(--primary-orange-dark) dark:hover:bg-(--primary-orange) dark:hover:brightness-110 hover:shadow-xl hover:shadow-(--primary-orange)/40 dark:hover:shadow-(--primary-orange)/30 transition-all duration-200 ease-out hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 text-base px-8 py-6 rounded-full"
                  >
                    <Link href={getDashboardHref()}>
                      Accéder au tableau de bord
                      <ChevronRight className="ml-1.5 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="group/btn border-2 border-(--primary-orange) text-(--primary-orange) bg-transparent hover:bg-(--primary-orange)/15 dark:hover:bg-(--primary-orange)/20 dark:border-(--primary-orange) hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-(--primary-orange)/25 dark:hover:shadow-(--primary-orange)/20 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out text-base px-8 py-6 rounded-full font-semibold"
                    >
                      <Link href="/login?mode=signin" className="inline-flex items-center gap-2">
                        <LogIn className="h-5 w-5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        Se connecter
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-2 border-(--primary-purple) text-(--primary-purple) bg-transparent hover:bg-(--primary-purple)/15 dark:hover:bg-(--primary-purple)/20 dark:border-(--primary-purple) hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-(--primary-purple)/25 dark:hover:shadow-(--primary-purple)/20 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out text-base px-8 py-6 rounded-full font-semibold"
                    >
                      <Link href="/login?mode=signup">Créer un compte</Link>
                    </Button>
                  </>
                )}
              </div>
              <Link
                href="https://www.learnsup.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-lg font-medium text-muted-foreground hover:text-(--primary-orange-dark) dark:hover:text-(--primary-orange) transition-all duration-200 group dark:text-white"
              >
                En savoir plus sur LearnSup
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
