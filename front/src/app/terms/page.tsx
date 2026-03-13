"use client";

import { BackButton } from "@/components/shared/back-button";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <BackButton href="/info" label="Retour aux informations" />

      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Conditions Générales d'Utilisation
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Dernière mise à jour : 3 Mars 2026
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-6 sm:p-10 space-y-8 text-[#26547c] dark:text-[#e6e6e6]">
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            1. Objet
          </h2>
          <p className="leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet
            d'encadrer les conditions d'utilisation de la plateforme LearnSup.
            En accédant à LearnSup, vous acceptez sans réserve l'intégralité de
            ces conditions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            2. Accès au service
          </h2>
          <p className="leading-relaxed">
            LearnSup est accessible gratuitement à tout utilisateur disposant
            d'un accès à internet. Tous les frais afférents à l'accès au
            service, que ce soient les frais matériels, logiciels ou d'accès à
            internet sont exclusivement à la charge de l'utilisateur.
          </p>
          <p className="leading-relaxed">
            Certaines parties de la plateforme sont réservées aux membres après
            identification à l'aide de leur Identifiant et de leur Mot de passe.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            3. Données personnelles
          </h2>
          <p className="leading-relaxed">
            LearnSup s'engage à ce que la collecte et le traitement de vos
            données soient conformes au Règlement Général sur la Protection des
            Données (RGPD) et à la loi Informatique et Libertés. Pour plus
            d'informations, veuillez consulter notre Politique de
            confidentialité.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            4. Propriété intellectuelle
          </h2>
          <p className="leading-relaxed">
            Les marques, logos, signes ainsi que tous les contenus du site
            (textes, images, son…) font l'objet d'une protection par le Code de
            la propriété intellectuelle et plus particulièrement par le droit
            d'auteur.
          </p>
          <p className="leading-relaxed">
            L'utilisateur sollicite l'autorisation préalable de LearnSup pour
            toute reproduction, publication, copie des différents contenus.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            5. Responsabilité
          </h2>
          <p className="leading-relaxed">
            LearnSup ne peut être tenue pour responsable de l'utilisation faite
            des services par les utilisateurs, ni des dommages directs ou
            indirects qui pourraient en découler.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            6. Modification des CGU
          </h2>
          <p className="leading-relaxed">
            LearnSup se réserve le droit de modifier les présentes CGU à tout
            moment. L'utilisateur est invité à consulter régulièrement cette
            page pour prendre connaissance des éventuelles modifications.
          </p>
        </section>
      </div>
    </div>
  );
}
