"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Settings, CreditCard, MessageSquare, Video } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { faqConfig } from "@/lib/faq-config";
import { FAQAccordion } from "@/components/domains/faq/FAQAccordion";
import { BackButton } from "@/components/shared/BackButton";
import { PageContainer } from "@/components/shared/layout";
import ShinyText from "@/components/ui/ShinyText";
import Loader from "@/components/shared/Loader";
import { useMemo, Suspense } from "react";

const categories = [
  {
    id: "general",
    name: "Général",
    icon: "logo" as const,
    href: "/help?category=general",
  },
  {
    id: "account",
    name: "Compte",
    icon: Settings,
    href: "/help?category=account",
  },
  {
    id: "payment",
    name: "Paiement",
    icon: CreditCard,
    href: "/help?category=payment",
  },
  {
    id: "gossip",
    name: "Boîte à ragots",
    icon: MessageSquare,
    href: "/help?category=gossip",
  },
  {
    id: "courses",
    name: "Cours en ligne",
    icon: Video,
    href: "/help?category=courses",
  },
  {
    id: "courses_presential",
    name: "Cours en présentiel",
    icon: MessageSquare,
    href: "/help?category=courses_presential",
  },
];

function HelpCenterContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const currentCategory = useMemo(
    () => categories.find((cat) => cat.id === selectedCategory),
    [selectedCategory],
  );

  const filteredQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    return faqConfig.questions.filter((q) => q.categoryId === selectedCategory);
  }, [selectedCategory]);

  if (selectedCategory && currentCategory) {
    const Icon = currentCategory.icon === "logo" ? null : currentCategory.icon;

    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <BackButton href="/help" label="Retour aux catégories" />
        </motion.div>

        <motion.div
          className="mb-6 sm:mb-8 mt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex flex-wrap items-center gap-4">
            {currentCategory.icon === "logo" && (
              <div className="relative h-10 w-10 shrink-0 rounded-xl bg-brand/15 p-1.5 ring-1 ring-brand/20">
                <Image
                  src="/logo/icon.png"
                  alt="LearnSup"
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
            )}
            {currentCategory.icon !== "logo" && Icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/20">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ls-heading">
              {currentCategory.name}
            </h1>
          </div>
          <p className="text-base sm:text-lg text-ls-muted mt-3 max-w-3xl">
            Questions fréquemment posées sur{" "}
            {currentCategory.name.toLowerCase()}
          </p>
        </motion.div>

        <motion.div
          className="mb-8 rounded-2xl border border-brand/25 bg-linear-to-br from-brand/10 via-card/80 to-ls-blue/5 p-6 sm:p-8 shadow-lg backdrop-blur-sm dark:from-brand/5 dark:via-card/60"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-ls-heading sm:text-2xl">
                Tu n&apos;as pas trouvé la réponse ?
              </h2>
              <p className="mt-2 text-sm text-ls-muted sm:text-base">
                Notre équipe de support est là pour t&apos;aider. Contacte-nous
                et nous te répondrons rapidement.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="w-full shrink-0 bg-brand font-bold text-white shadow-md hover:bg-brand/90 hover:shadow-lg sm:w-auto"
            >
              <Link href="/support-request">Contacter le support</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-border/50 bg-card/95 p-5 shadow-xl backdrop-blur-md sm:p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {filteredQuestions.length > 0 && (
            <FAQAccordion items={filteredQuestions} exclusive />
          )}
          {filteredQuestions.length === 0 && (
            <p className="py-8 text-center text-ls-muted">
              Aucune question disponible pour cette catégorie pour le moment.
            </p>
          )}
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <BackButton href="/info" label="Retour aux informations" />
      </motion.div>

      <motion.div
        className="mb-6 sm:mb-8 mt-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
          <ShinyText text="Centre d'aide" />
        </h1>
        <p className="mt-2 max-w-3xl text-base text-ls-muted sm:text-lg">
          Retrouve l&apos;ensemble des informations sur l&apos;application
        </p>
      </motion.div>

      <motion.div
        className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-brand/25 bg-linear-to-br from-brand/10 via-card/80 to-transparent p-6 shadow-lg backdrop-blur-sm dark:from-brand/5 sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-ls-heading sm:text-2xl">
              Tu n&apos;as pas trouvé la réponse ?
            </h2>
            <p className="mt-2 text-sm text-ls-muted sm:text-base">
              Notre équipe de support est là pour t&apos;aider. Contacte-nous
              et nous te répondrons rapidement.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="w-full bg-brand font-bold text-white shadow-md hover:bg-brand/90 md:w-auto"
          >
            <Link href="/support-request">Contacter le support</Link>
          </Button>
        </div>

        <div className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-border/50 bg-card/95 p-6 shadow-xl backdrop-blur-md sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-ls-heading sm:text-2xl">
              Suivre mes demandes
            </h2>
            <p className="mt-2 text-sm text-ls-muted sm:text-base">
              Consulte l&apos;historique de tes échanges avec le support et
              l&apos;état de tes tickets en cours.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full border-brand font-bold text-brand hover:bg-brand/10 md:w-auto"
          >
            <Link href="/help/support">Mes tickets support</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        {categories.map((category) => {
          const Icon = category.icon === "logo" ? null : category.icon;

          let iconElement = null;
          if (category.icon === "logo") {
            iconElement = (
              <div className="relative h-14 w-14 shrink-0 transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
                <Image
                  src="/logo/icon.png"
                  alt="LearnSup"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
            );
          } else if (Icon) {
            iconElement = (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
                <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.5} />
              </div>
            );
          }

          return (
            <Link
              key={category.id}
              href={category.href}
              className="group flex min-h-[160px] flex-col items-center justify-center gap-4 rounded-2xl border border-border/50 bg-card/95 p-6 shadow-md backdrop-blur-md transition-all duration-200 hover:border-brand/40 hover:shadow-xl sm:p-8"
            >
              {iconElement}
              <span className="text-center text-base font-semibold text-ls-heading sm:text-lg">
                {category.name}
              </span>
            </Link>
          );
        })}
      </motion.div>
    </PageContainer>
  );
}

export default function HelpCenterPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader size="lg" message="Chargement..." />
          </div>
        </PageContainer>
      }
    >
      <HelpCenterContent />
    </Suspense>
  );
}
