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
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";

const PALIERS = [
  {
    title: "Explorer",
    min: 0,
    max: 5,
    description: "Tu découvres les ateliers et poses tes premières bases.",
    icon: Star,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
  {
    title: "Challenger",
    min: 6,
    max: 10,
    description: "Tu enchaînes les ateliers et relèves les défis.",
    icon: Zap,
    color: "from-orange-500 to-[#FF8C42]",
    shadow: "shadow-orange-500/25",
  },
  {
    title: "Achiever",
    min: 11,
    max: 20,
    description: "Tu as prouvé ta régularité et ton engagement.",
    icon: Trophy,
    color: "from-[#FF8C42] to-[#FFB647]",
    shadow: "shadow-[#FF8C42]/25",
  },
  {
    title: "Visionary",
    min: 21,
    max: null,
    description: "Tu es un pilier de la communauté LearnSup.",
    icon: Sparkles,
    color: "from-[#FFB647] to-amber-300",
    shadow: "shadow-amber-400/25",
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.03 * i },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function PaliersPage() {
  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white shadow-lg shadow-[#FF8C42]/25">
              <Trophy className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <ShinyText text="Les paliers" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Découvre ta progression et les titres qui valorisent ton engagement
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-8"
      >
        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5"
        >
          <h2 className="text-lg sm:text-xl font-bold text-ls-heading mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Target className="h-5 w-5" />
            </span>
            Comment ça marche ?
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-ls-muted leading-relaxed">
            <p>
              Ton titre (Explorer, Challenger, Achiever, Visionary) est calculé
              automatiquement en fonction du nombre d&apos;ateliers auxquels tu
              as participé et où tu as été marqué présent. Plus tu participes,
              plus tu montes en palier.
            </p>
            <p>
              Les ateliers validés (présence confirmée par le mentor) comptent
              pour ta progression. Continue à t&apos;inscrire et à participer
              pour débloquer le palier suivant.
            </p>
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5"
        >
          <h2 className="text-lg sm:text-xl font-bold text-ls-heading mb-6 flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Sparkles className="h-5 w-5" />
            </span>
            Les quatre paliers
          </h2>
          <div className="grid gap-4 sm:gap-5">
            {PALIERS.map((palier, index) => {
              const Icon = palier.icon;
              return (
                <motion.div
                  key={palier.title}
                  variants={itemVariants}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border border-border/50 bg-card/80 hover:bg-brand/5 hover:border-brand/30 transition-all duration-300 hover:shadow-lg hover:shadow-brand/10"
                >
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${palier.color} text-white shadow-lg ${palier.shadow} group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ls-heading text-base sm:text-lg">
                      {palier.title}
                    </h3>
                    <p className="text-sm text-ls-muted mt-1">{palier.description}</p>
                    <p className="text-xs sm:text-sm font-semibold text-brand mt-2">
                      {palier.max !== null
                        ? `${palier.min} à ${palier.max} ateliers`
                        : `${palier.min}+ ateliers`}
                    </p>
                  </div>
                  {index < PALIERS.length - 1 && (
                    <div className="hidden sm:flex items-center text-border/60">
                      <ChevronRight className="h-5 w-5 -rotate-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          variants={itemVariants}
          className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5"
        >
          <h2 className="text-lg sm:text-xl font-bold text-ls-heading mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Trophy className="h-5 w-5" />
            </span>
            Récompenses
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-ls-muted leading-relaxed">
            <p>
              En montant en palier, tu valorises ton profil auprès des mentors et
              de la communauté. Ton titre apparaît sur ton profil et dans
              l&apos;Catalogue, montrant ton engagement et ta régularité.
            </p>
            <p>
              Plus tu progresses, plus tu démontres ta motivation — et plus tu
              pourras prétendre aux ateliers les plus demandés. Continue à
              participer pour atteindre le palier Visionary.
            </p>
          </div>
        </motion.section>

        <motion.div
          variants={itemVariants}
          className="flex justify-center pt-4"
        >
          <Button asChild variant="cta" size="cta" className="gap-2">
            <Link href="/dashboard">
              Retour au tableau de bord
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}
