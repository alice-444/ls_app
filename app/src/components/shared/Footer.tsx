import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";

const footerLinks = [
  { href: "/info", label: "Informations" },
  { href: "/help", label: "Aide" },
  { href: "/legal", label: "Mentions" },
  { href: "/terms", label: "CGU" },
  { href: "/privacy", label: "Confidentialité" },
];

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/learn_sup/",
    Icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/learnsup/",
    Icon: Linkedin,
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="border-t border-[#d6dae4] dark:border-[#d6dae4] pt-6 sm:pt-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="relative w-20 h-24 shrink-0">
                <Image
                  src="/logo/logo_vertical.png"
                  alt="LearnSup"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm">
                {footerLinks.map((link, index) => (
                  <div key={link.href + link.label} className="flex items-center gap-3 sm:gap-6">
                    <Link
                      href={link.href}
                      className="group relative text-[#26547c] dark:text-[#e6e6e6] transition-all duration-300 hover:text-[#FF8C42] dark:hover:text-[#FF8C42] font-medium"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#FF8C42] to-[#FFB647] transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    {index < footerLinks.length - 1 && (
                      <span className="text-[rgba(38,84,124,0.64)] dark:text-[rgba(230,230,230,0.64)]">
                        •
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                {socialLinks.map((social) => {
                  const IconComponent = social.Icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative text-[#26547c] dark:text-[#e6e6e6] transition-all duration-300 hover:text-[#FF8C42] dark:hover:text-[#FF8C42]"
                      aria-label={social.name}
                    >
                      <div className="relative p-2 rounded-full transition-all duration-300 group-hover:bg-[#FF8C42]/10 group-hover:scale-110 group-hover:rotate-6">
                        <IconComponent className="w-6 h-6 transition-all duration-300 group-hover:scale-110" />
                        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF8C42] to-[#FFB647] opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#26547c] dark:text-[#e6e6e6]">
                FOR STUDENTS. BY STUDENTS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
