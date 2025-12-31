import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Youtube } from "lucide-react";

const footerLinks = [
  { href: "/legal", label: "Mentions" },
  { href: "/terms", label: "CGU" },
  { href: "/privacy", label: "Confidentialité" },
  { href: "/privacy", label: "Cookies" },
];

const socialLinks = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    Icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    Icon: Linkedin,
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    Icon: Youtube,
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="border-t border-[#d6dae4] dark:border-[#d6dae4] pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative w-16 h-16 shrink-0">
              <Image
                src="/logo/icon.png"
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
                    className="text-[#26547c] dark:text-[#e6e6e6] hover:underline transition-colors"
                  >
                    {link.label}
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
                    className="text-[#26547c] dark:text-[#e6e6e6] hover:text-[#FF8C42] transition-colors"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-6 h-6" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
