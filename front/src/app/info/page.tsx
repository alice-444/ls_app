"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { getUserRole } from "@/lib/api-client";

export default function InfoPage() {
  const { data: session } = authClient.useSession();
  const { data: userRole } = useQuery({
    queryKey: ["userRole", session?.user?.id],
    queryFn: getUserRole,
    enabled: !!session?.user?.id,
  });

  const infoLinks = [
    { title: "Foire aux questions", href: "/faq" },
    { title: "Centre d'aide", href: "/help" },
    { title: "Conditions d'utilisation générales", href: "/terms" },
    { title: "Mentions légales", href: "/legal" },
    {
      title: "Politique de confidentialité et gestion des cookies",
      href: "/privacy",
    },
  ];

  const subtitle =
    userRole === "APPRENANT"
      ? "Retrouvez les informations utiles pour votre parcours d'apprenant : e-Atelier, crédits, connexions aux mentors."
      : userRole === "MENTOR"
        ? "Retrouvez les informations utiles pour votre activité de mentor : ateliers, demandes, crédits."
        : "Retrouvez l'ensemble des informations sur l'application";

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Informations sur LearnSup
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#26547c] dark:text-[#e6e6e6]">
            À propos de LearnSup
          </h2>
          <p className="text-[#26547c] dark:text-[#e6e6e6] leading-relaxed">
            LearnSup est une plateforme d'apprentissage solidaire née de la
            volonté de rendre le soutien scolaire et l'échange de compétences
            accessibles à tous les étudiants.
          </p>
          <p className="text-[#26547c] dark:text-[#e6e6e6] leading-relaxed">
            Notre mission est de connecter des mentors passionnés avec des
            apprenants motivés dans un environnement bienveillant et structuré.
            Que vous soyez là pour approfondir vos connaissances ou pour
            partager votre expertise, LearnSup vous offre les outils nécessaires
            pour réussir.
          </p>
        </div>

        <div className="bg-[#FF8C42]/10 dark:bg-[#FF8C42]/5 border-2 border-[#FF8C42]/20 rounded-2xl p-6 sm:p-8 flex flex-col justify-center items-center text-center space-y-4">
          <h3 className="text-xl font-bold text-[#26547c] dark:text-[#e6e6e6]">
            Besoin d'aide ?
          </h3>
          <p className="text-[#26547c]/80 dark:text-[#e6e6e6]/80 text-sm">
            Notre équipe est disponible pour répondre à toutes vos questions.
          </p>
          <Link href="/support-request" className="w-full">
            <button className="w-full bg-[#FF8C42] hover:bg-[#FF8C42]/90 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-md">
              Nous contacter
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
        <h2 className="text-xl font-bold text-[#26547c] dark:text-[#e6e6e6] mb-6">
          Liens utiles
        </h2>
        <div className="flex flex-col gap-4">
          {infoLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white dark:bg-[rgba(255,255,255,0.08)] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <span className="text-[#26547c] dark:text-[#e6e6e6] text-sm sm:text-base font-semibold">
                {link.title}
              </span>
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 text-[#26547c] dark:text-[#e6e6e6] group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
