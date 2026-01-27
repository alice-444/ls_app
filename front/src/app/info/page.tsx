"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function InfoPage() {
  const infoLinks = [
    {
      title: "Foire aux questions",
      href: "/help",
    },
    {
      title: "Conditions d'utilisation générales",
      href: "/terms",
    },
    {
      title: "Mentions légales",
      href: "/legal",
    },
    {
      title: "Politique de confidentialité et gestion des cookies",
      href: "/privacy",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 mb-6 sm:mb-8">
      <div className="mb-6 sm:mb-8">
        <div className="bg-[#26547c] dark:bg-[#1a1720] text-white inline-block px-8 py-4 rounded-tl-[36px] rounded-br-[36px] rounded-tr-[4px] rounded-bl-[4px] mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
            Informations sur LearnSup
          </h1>
        </div>
        <p className="text-base sm:text-xl md:text-2xl text-[#161616] dark:text-[#e6e6e6] mt-4 sm:mt-6">
          Retrouvez l'ensemble des informations sur l'application
        </p>
      </div>

      <div className="bg-white dark:bg-[#1a1720] border border-[#d6dae4] dark:border-[#d6dae4] rounded-2xl p-5 sm:p-8">
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
