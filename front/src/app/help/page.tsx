"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Settings, CreditCard, MessageSquare, Video } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { faqConfig } from "@/lib/faq-config";
import { FAQAccordion } from "@/components/faq/FAQAccordion";
import { BackButton } from "@/components/back-button";
import { useMemo, Suspense } from "react";

function HelpCenterContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const categories = [
    {
      id: "general",
      name: "Général",
      icon: "logo",
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

  // Get category details
  const currentCategory = useMemo(() => {
    return categories.find((cat) => cat.id === selectedCategory);
  }, [selectedCategory]);

  // Get filtered questions for the selected category
  const filteredQuestions = useMemo(() => {
    if (!selectedCategory) return [];
    return faqConfig.questions.filter((q) => q.categoryId === selectedCategory);
  }, [selectedCategory]);

  // If a category is selected, show the questions
  if (selectedCategory && currentCategory) {
    const Icon = currentCategory.icon === "logo" ? null : currentCategory.icon;

    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
        <BackButton href="/help" label="Retour aux catégories" />

        <div className="mb-6 sm:mb-8">
          <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-flex items-center gap-4 px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
            {currentCategory.icon === "logo" && (
              <div className="relative w-8 h-8">
                <Image
                  src="/logo/icon.png"
                  alt="LearnSup"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            {currentCategory.icon !== "logo" && Icon && (
              <Icon className="w-8 h-8" strokeWidth={2} />
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
              {currentCategory.name}
            </h1>
          </div>
          <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
            Questions fréquemment posées sur{" "}
            {currentCategory.name.toLowerCase()}
          </p>
        </div>

        <div className="mb-8 bg-linear-to-r from-[#FF8C42]/10 to-[#26547c]/10 dark:from-[#FF8C42]/5 dark:to-[#26547c]/5 border-2 border-[#FF8C42]/20 dark:border-[#FF8C42]/30 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-2">
                Tu n'as pas trouvé la réponse ?
              </h2>
              <p className="text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)] text-sm sm:text-base">
                Notre équipe de support est là pour t'aider. Contacte-nous et
                nous te répondrons rapidement.
              </p>
            </div>
            <Link href="/support-request">
              <Button
                size="lg"
                className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white font-bold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                Contacter le support
              </Button>
            </Link>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
          {filteredQuestions.length > 0 && (
            <FAQAccordion items={filteredQuestions} exclusive={true} />
          )}
          {filteredQuestions.length === 0 && (
            <p className="text-[#26547c] dark:text-[#e6e6e6] text-center py-8">
              Aucune question disponible pour cette catégorie pour le moment.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <BackButton href="/info" label="Retour aux informations" />

      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Foire aux questions
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Retrouvez l'ensemble des informations sur l'application
        </p>
      </div>

      {/* Contact Support Section */}
      <div className="mb-8 bg-linear-to-r from-[#FF8C42]/10 to-[#26547c]/10 dark:from-[#FF8C42]/5 dark:to-[#26547c]/5 border-2 border-[#FF8C42]/20 dark:border-[#FF8C42]/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-2">
              Tu n'as pas trouvé la réponse ?
            </h2>
            <p className="text-[rgba(38,84,124,0.8)] dark:text-[rgba(230,230,230,0.8)] text-sm sm:text-base">
              Notre équipe de support est là pour t'aider. Contacte-nous et nous
              te répondrons rapidement.
            </p>
          </div>
          <Link href="/support-request">
            <Button
              size="lg"
              className="bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white font-bold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Contacter le support
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {categories.map((category) => {
          const Icon = category.icon === "logo" ? null : category.icon;

          let iconElement = null;
          if (category.icon === "logo") {
            iconElement = (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 group-hover:scale-110 transition-transform">
                <Image
                  src="/logo/icon.png"
                  alt="LearnSup"
                  fill
                  className="object-contain"
                />
              </div>
            );
          } else if (Icon) {
            iconElement = (
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-[#26547c] dark:text-[#e6e6e6] group-hover:scale-110 transition-transform">
                <Icon className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1.5} />
              </div>
            );
          }

          return (
            <Link
              key={category.id}
              href={category.href}
              className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all duration-200 group min-h-[160px]"
            >
              {iconElement}
              <span className="text-[#26547c] dark:text-[#e6e6e6] text-base sm:text-lg font-semibold text-center">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function HelpCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-[#26547c] dark:text-[#e6e6e6] text-lg">
              Chargement...
            </div>
          </div>
        </div>
      }
    >
      <HelpCenterContent />
    </Suspense>
  );
}
