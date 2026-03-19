"use client";

import { faqConfig } from "@/lib/faq-config";
import { FAQAccordion } from "@/components/domains/faq/FAQAccordion";
import { BackButton } from "@/components/shared/BackButton";

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <BackButton href="/help" label="Retour au centre d'aide" />

      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Foire aux questions
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Retrouvez ici toutes les réponses à vos questions, regroupées par thématique.
        </p>
      </div>

      <div className="space-y-12">
        {faqConfig.categories.sort((a, b) => a.order - b.order).map((category) => {
          const categoryQuestions = faqConfig.questions.filter(
            (q) => q.categoryId === category.id
          );

          if (categoryQuestions.length === 0) return null;

          return (
            <section key={category.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-1 w-12 bg-[#FF8C42] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#26547c] dark:text-[#e6e6e6]">
                  {category.name}
                </h2>
              </div>

              <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
                <FAQAccordion items={categoryQuestions} exclusive={false} />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
