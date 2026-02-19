"use client";

import Link from "next/link";
import {
  Trophy,
  Sparkles,
  Target,
  ChevronRight,
  Star,
  Zap,
} from "lucide-react";
import { BackButton } from "@/components/back-button";

const PALIERS = [
  {
    title: "Explorer",
    min: 0,
    max: 5,
    description: "Tu découvres les ateliers et poses tes premières bases.",
    icon: Star,
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "Challenger",
    min: 6,
    max: 10,
    description: "Tu enchaînes les ateliers et relèves les défis.",
    icon: Zap,
    color: "from-orange-500 to-[#FF8C42]",
  },
  {
    title: "Achiever",
    min: 11,
    max: 20,
    description: "Tu as prouvé ta régularité et ton engagement.",
    icon: Trophy,
    color: "from-[#FF8C42] to-[#FFB647]",
  },
  {
    title: "Visionary",
    min: 21,
    max: null,
    description: "Tu es un pilier de la communauté LearnSup.",
    icon: Sparkles,
    color: "from-[#FFB647] to-amber-300",
  },
] as const;

export default function PaliersPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <div className="mb-6 sm:mb-8">
        <BackButton />
        <div className="bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white inline-block px-6 sm:px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6 shadow-lg shadow-[#FF8C42]/20">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black flex items-center gap-2">
            <Trophy className="h-8 w-8 sm:h-9 sm:w-9" />
            Les paliers
          </h1>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <section className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-[#FF8C42]" />
            Comment ça marche ?
          </h2>
          <p className="text-[#161616] dark:text-[#e6e6e6] text-sm sm:text-base leading-relaxed mb-4">
            Ton titre (Explorer, Challenger, Achiever, Visionary) est calculé
            automatiquement en fonction du nombre d&apos;ateliers auxquels tu as
            participé et où tu as été marqué présent. Plus tu participes, plus tu
            montes en palier.
          </p>
          <p className="text-[#161616] dark:text-[#e6e6e6] text-sm sm:text-base leading-relaxed">
            Les ateliers validés (présence confirmée par le mentor) comptent
            pour ta progression. Continue à t&apos;inscrire et à participer pour
            débloquer le palier suivant.
          </p>
        </section>

        <section className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#FF8C42]" />
            Les quatre paliers
          </h2>
          <div className="grid gap-4 sm:gap-6">
            {PALIERS.map((palier) => {
              const Icon = palier.icon;
              return (
                <div
                  key={palier.title}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-xl bg-[rgba(255,140,66,0.06)] dark:bg-[rgba(255,140,66,0.08)] border border-[#FF8C42]/20 dark:border-[#FF8C42]/25"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${palier.color} text-white`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#26547c] dark:text-[#e6e6e6] text-base sm:text-lg">
                      {palier.title}
                    </h3>
                    <p className="text-sm text-[rgba(38,84,124,0.85)] dark:text-[rgba(230,230,230,0.85)] mt-1">
                      {palier.description}
                    </p>
                    <p className="text-xs sm:text-sm text-[#FF8C42] font-medium mt-2">
                      {palier.max !== null
                        ? `${palier.min} à ${palier.max} ateliers`
                        : `${palier.min}+ ateliers`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#FF8C42]" />
            Récompenses
          </h2>
          <p className="text-[#161616] dark:text-[#e6e6e6] text-sm sm:text-base leading-relaxed mb-4">
            En montant en palier, tu valorises ton profil auprès des mentors et
            de la communauté. Ton titre apparaît sur ton profil et dans l&apos;e-Atelier,
            montrant ton engagement et ta régularité.
          </p>
          <p className="text-[#161616] dark:text-[#e6e6e6] text-sm sm:text-base leading-relaxed">
            Plus tu progresses, plus tu démontres ta motivation — et plus tu
            pourras prétendre aux ateliers les plus demandés. Continue à
            participer pour atteindre le palier Visionary.
          </p>
        </section>

        <div className="flex justify-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[32px] bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white font-semibold px-6 py-3 text-sm sm:text-base transition-colors"
          >
            Retour au tableau de bord
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
