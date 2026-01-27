"use client";

import { BackButton } from "@/components/back-button";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <BackButton href="/info" label="Retour aux informations" />

      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Politique de confidentialité
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Politique de confidentialité et gestion des cookies
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
        <p className="text-[#26547c] dark:text-[#e6e6e6] text-base">
          Le contenu de la politique de confidentialité sera ajouté
          prochainement.
        </p>
      </div>
    </div>
  );
}
