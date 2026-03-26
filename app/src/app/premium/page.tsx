"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Check, Sparkles, Headphones, BookOpen, Star } from "lucide-react";
import { PageContainer } from "@/components/shared/layout";
import { BackButton } from "@/components/shared/BackButton";
import ShinyText from "@/components/ui/ShinyText";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Cours exclusifs",
    description: "Accède à des contenus et ateliers réservés aux membres Premium.",
  },
  {
    icon: Headphones,
    title: "Support prioritaire",
    description: "Une équipe dédiée répond à tes questions en priorité.",
  },
  {
    icon: Star,
    title: "Mentors premium",
    description: "Connecte-toi avec des mentors sélectionnés pour leur expertise.",
  },
] as const;

export default function PremiumPage() {
  const router = useRouter();
  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <BackButton onClick={() => router.back()} />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#FF8C42] via-[#FFB647] to-[#FF8C42] text-white shadow-lg shadow-[#FF8C42]/25">
              <Crown className="h-6 w-6 sm:h-7 sm:w-7" />
            </span>
            <ShinyText text="Version Premium" />
          </h1>
          <p className="text-base sm:text-lg text-ls-muted mt-2">
            Débloque des fonctionnalités exclusives pour booster ton apprentissage
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="space-y-6 sm:space-y-8"
      >
        <section className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5">
          <h2 className="text-lg sm:text-xl font-bold text-ls-heading mb-6 flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
              <Sparkles className="h-5 w-5" />
            </span>{" "}
            Ce que tu obtiens avec Premium
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
                  className="flex flex-col p-5 rounded-2xl border border-border/50 bg-card/80 hover:bg-brand/5 hover:border-brand/30 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-ls-heading text-base mb-2">{benefit.title}</h3>
                  <p className="text-sm text-ls-muted flex-1">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-brand/30 bg-linear-to-br from-brand/5 to-brand/10 dark:from-brand/10 dark:to-brand/5 p-6 sm:p-8 shadow-xl shadow-black/5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/15 text-brand">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-ls-heading mb-2">
                  Prêt à passer au niveau supérieur ?
                </h2>
                <p className="text-sm text-ls-muted">
                  Contacte-nous pour découvrir les offres Premium et les tarifs adaptés à tes besoins.
                </p>
              </div>
            </div>
            <Button asChild variant="cta" size="cta" className="shrink-0">
              <Link href="/support-request">Nous contacter</Link>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-md p-6 sm:p-8 shadow-xl shadow-black/5">
          <h2 className="text-lg sm:text-xl font-bold text-ls-heading mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-brand" />
            Inclus dans Premium
          </h2>
          <ul className="space-y-3 text-sm text-ls-muted">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              Cours et ateliers exclusifs
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              Support prioritaire par email et chat
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              Accès aux mentors premium
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-brand" />
              Contenus et ressources additionnelles
            </li>
          </ul>
        </section>
      </motion.div>
    </PageContainer>
  );
}
