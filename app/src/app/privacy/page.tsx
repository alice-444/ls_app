"use client";

import { BackButton } from "@/components/shared/BackButton";

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
          Dernière mise à jour : 3 Mars 2026
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-6 sm:p-10 space-y-8 text-[#26547c] dark:text-[#e6e6e6]">
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            1. Collecte des données
          </h2>
          <p className="leading-relaxed">
            Nous collectons les informations que vous nous fournissez lors de
            la création de votre compte, telles que votre nom, adresse e-mail,
            et profil académique.
          </p>
          <p className="leading-relaxed">
            Nous collectons également des données d'utilisation pour améliorer
            notre service via des cookies techniques essentiels.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            2. Finalités du traitement
          </h2>
          <p className="leading-relaxed">
            Vos données sont traitées pour :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>La gestion de votre compte utilisateur</li>
            <li>La mise en relation entre étudiants et mentors</li>
            <li>La communication via la messagerie intégrée</li>
            <li>L'amélioration de l'expérience utilisateur</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            3. Conservation des données
          </h2>
          <p className="leading-relaxed">
            Vos données personnelles sont conservées aussi longtemps que votre
            compte est actif. En cas de suppression de compte, vos données sont
            supprimées ou anonymisées dans un délai de 30 jours, sauf
            obligations légales contraires.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            4. Vos droits (RGPD)
          </h2>
          <p className="leading-relaxed">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Droit d'accès et de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
          <p className="leading-relaxed">
            Vous pouvez exercer ces droits en nous contactant via le centre
            d'aide ou directement par e-mail.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#FF8C42] inline-block pb-1">
            5. Cookies
          </h2>
          <p className="leading-relaxed">
            LearnSup utilise des cookies strictement nécessaires au
            fonctionnement de la plateforme (authentification, sécurité). Nous
            n'utilisons pas de cookies publicitaires de tiers.
          </p>
        </section>
      </div>
    </div>
  );
}
