"use client";

import { BackButton } from "@/components/shared/BackButton";
import { PageContainer } from "@/components/shared/layout";

export default function LegalPage() {
  return (
    <PageContainer className="py-4 sm:py-6 lg:py-8">
      <BackButton href="/info" label="Retour aux informations" />

      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Mentions légales
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Informations légales concernant la plateforme LearnSup
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-6 sm:p-10 space-y-8 text-[#26547c] dark:text-[#e6e6e6]">
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            1. Éditeur du site
          </h2>
          <p className="leading-relaxed">
            Le site LearnSup est édité par la société LearnSup SAS, au capital
            de 1 000 euros, immatriculée au Registre du Commerce et des
            Sociétés de Paris sous le numéro 123 456 789.
          </p>
          <p className="leading-relaxed">
            <strong>Siège social :</strong> 123 Avenue des Étudiants, 75000
            Paris, France.
          </p>
          <p className="leading-relaxed">
            <strong>Directeur de la publication :</strong> Jean Dupont, en sa
            qualité de Président.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            2. Hébergement
          </h2>
          <p className="leading-relaxed">
            Le site est hébergé par la société Vercel Inc., située au 340 S
            Lemon Ave #4133 Walnut, CA 91789, USA.
          </p>
          <p className="leading-relaxed">
            La base de données est hébergée par Neon, située au 1450 Fashion
            Island Blvd, San Mateo, CA 94404, USA.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            3. Contact
          </h2>
          <p className="leading-relaxed">
            Pour toute question concernant le site, vous pouvez nous contacter :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Par e-mail : support@learnsup.fr</li>
            <li>Via notre centre d'aide en ligne</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            4. Crédits
          </h2>
          <p className="leading-relaxed">
            Design et développement par l'équipe LearnSup.
          </p>
        </section>
      </div>
    </PageContainer>
  );
}
