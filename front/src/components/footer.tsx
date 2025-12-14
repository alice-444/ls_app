"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaYoutube, FaLinkedin, FaInstagram } from "react-icons/fa";

interface SocialLink {
  readonly url: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly color?: string;
}

interface FooterProps {
  readonly className?: string;
  readonly variant?: "default" | "minimal" | "gradient";
  readonly socialLinks?: Partial<{
    instagram: string;
    tiktok: string;
    linkedin: string;
  }>;
  readonly rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  readonly padding?: "sm" | "md" | "lg" | "xl";
  readonly copyrightText?: string | React.ReactNode;
  readonly companyName?: string;
  readonly showYear?: boolean;
  readonly showCopyright?: boolean;
  readonly links?: Array<{
    readonly label: string;
    readonly href: string;
    readonly target?: "_blank" | "_self";
  }>;
  readonly additionalLinks?: Array<{
    readonly label: string;
    readonly href: string;
    readonly target?: "_blank" | "_self";
  }>;
  readonly logo?:
    | {
        readonly src?: string;
        readonly alt?: string;
        readonly width?: number;
        readonly height?: number;
      }
    | React.ReactNode;
  readonly logoHref?: string;
  readonly logoPosition?: "left" | "center" | "right";
  readonly showLogo?: boolean;
}

export default function Footer({
  className = "",
  variant = "default",
  socialLinks: customSocialLinks,
  rounded = "2xl",
  padding = "md",
  copyrightText,
  companyName = "LearnSup",
  showYear = true,
  showCopyright = false,
  links,
  additionalLinks,
  logo,
  logoHref = "/",
  logoPosition = "left",
  showLogo = true,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const defaultLogoConfig = {
    src: "/logo/icon.png",
    alt: `${companyName} Logo`,
    width: 80,
    height: 30,
  };

  const getLogoToUse = () => {
    if (!showLogo) return null;

    if (logo) {
      if (typeof logo === "object" && "src" in logo) {
        return { ...defaultLogoConfig, ...logo };
      }
      return logo;
    }

    return defaultLogoConfig;
  };

  const logoToUse = getLogoToUse();

  const defaultCopyrightText = showYear
    ? `Copyright © ${currentYear} - ${companyName} Tous droits réservés`
    : `${companyName} Tous droits réservés`;

  const copyrightContent = copyrightText || defaultCopyrightText;

  const defaultLinks = [
    { label: "Contact", href: "/contact" },
    { label: "confidentialité", href: "/privacy-policy" },
    { label: "CGU", href: "/terms-of-service" },
  ];

  const footerLinks = links || defaultLinks;

  const defaultSocialLinks = {
    instagram: "https://instagram.com/learnsup",
    tiktok: "https://tiktok.com/@learnsup",
    linkedin: "https://linkedin.com/company/learnsup",
  };

  const socialLinks = { ...defaultSocialLinks, ...customSocialLinks };

  const socialIcons: SocialLink[] = [
    {
      url: socialLinks.instagram || defaultSocialLinks.instagram,
      label: "Instagram",
      icon: <FaInstagram className="w-full h-full" />,
      color: "hover:text-[#E4405F]",
    },
    {
      url: socialLinks.tiktok || defaultSocialLinks.tiktok,
      label: "YouTube",
      icon: <FaYoutube className="w-full h-full" />,
      color: "hover:text-[#FF0000]",
    },
    {
      url: socialLinks.linkedin || defaultSocialLinks.linkedin,
      label: "LinkedIn",
      icon: <FaLinkedin className="w-full h-full" />,
      color: "hover:text-[#0077B5]",
    },
  ];

  const variantStyles = {
    default: "bg-white dark:bg-slate-900 shadow-none sm:shadow-xl md:shadow-xl",
    minimal:
      "bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-none sm:shadow-lg md:shadow-lg",
    gradient:
      "bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-none sm:shadow-xl md:shadow-xl",
  };

  const roundedSizes = {
    sm: "rounded-lg",
    md: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-[24px]",
    "2xl": "rounded-full",
    full: "rounded-full",
  };

  const paddingSizes = {
    sm: "px-4 py-0.5 sm:px-6 md:px-6",
    md: "px-5 py-0.5 sm:px-8 sm:py-1 md:px-8 md:py-1",
    lg: "px-6 py-1 sm:px-12 sm:py-1.5 md:px-12 md:py-1.5",
    xl: "px-8 py-1 sm:px-16 sm:py-2 md:px-16 md:py-2",
  };

  return (
    <footer className={`relative w-full -mt-4 ${className}`}>
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 md:px-6 lg:px-8 py-0">
        <div
          className={`${variantStyles[variant]} ${roundedSizes[rounded]} border-0 ${paddingSizes[padding]} flex flex-row items-center justify-center sm:justify-between gap-2 sm:gap-1.5 md:gap-2 mx-auto max-w-5xl transition-all duration-300 bg-transparent sm:bg-white sm:dark:bg-slate-900`}
        >
          <div
            className={`flex flex-row items-center justify-center gap-1.5 sm:gap-4 w-auto sm:w-full ${
              logoPosition === "right" ? "sm:ml-auto" : ""
            }`}
          >
            {logoToUse && (
              <div className="shrink-0 hidden sm:block">
                {typeof logoToUse === "object" &&
                "src" in logoToUse &&
                logoToUse.src
                  ? (() => {
                      const imageElement = (
                        <Image
                          src={logoToUse.src}
                          alt={logoToUse.alt || `logo`}
                          width={logoToUse.width || 120}
                          height={logoToUse.height || 40}
                          className="h-auto object-contain"
                          priority={false}
                          unoptimized={logoToUse.src.endsWith(".svg")}
                        />
                      );
                      return logoHref ? (
                        <Link href={logoHref} className="block">
                          {imageElement}
                        </Link>
                      ) : (
                        imageElement
                      );
                    })()
                  : (() => {
                      if (logoHref && typeof logoToUse !== "object") {
                        return (
                          <Link href={logoHref} className="block">
                            {logoToUse as React.ReactNode}
                          </Link>
                        );
                      }
                      return logoToUse as React.ReactNode;
                    })()}
              </div>
            )}

            {showCopyright ? (
              <div className="text-slate-700 dark:text-slate-300 text-[10px] sm:text-sm md:text-base font-medium transition-colors">
                {copyrightContent}
              </div>
            ) : (
              footerLinks &&
              footerLinks.length > 0 && (
                <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-3 md:gap-4 text-[10px] sm:text-base md:text-lg w-auto sm:w-full">
                  {footerLinks.slice(0, 2).map((link, index) => (
                    <React.Fragment key={link.href}>
                      <Link
                        href={link.href}
                        target={
                          (link as { target?: "_blank" | "_self" }).target ||
                          "_self"
                        }
                        rel={
                          (link as { target?: "_blank" | "_self" }).target ===
                          "_blank"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-normal sm:font-medium whitespace-nowrap"
                      >
                        {link.label}
                      </Link>
                      {index < Math.min(footerLinks.length, 2) - 1 && (
                        <span className="text-slate-400 dark:text-slate-500 text-[8px] sm:text-base">
                          •
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                  {footerLinks.length > 2 && (
                    <span className="hidden sm:inline">
                      {footerLinks.slice(2).map((link, index) => (
                        <React.Fragment key={link.href}>
                          <Link
                            href={link.href}
                            target={
                              (link as { target?: "_blank" | "_self" })
                                .target || "_self"
                            }
                            rel={
                              (link as { target?: "_blank" | "_self" })
                                .target === "_blank"
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium"
                          >
                            {link.label}
                          </Link>
                          {index < footerLinks.slice(2).length - 1 && (
                            <span className="text-slate-400 dark:text-slate-500">
                              •
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </span>
                  )}
                </div>
              )
            )}
            {additionalLinks && additionalLinks.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-3 md:gap-4 text-[9px] sm:text-xs md:text-sm">
                {additionalLinks.map((link, index) => (
                  <React.Fragment key={link.href}>
                    <Link
                      href={link.href}
                      target={link.target || "_self"}
                      rel={
                        link.target === "_blank"
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </Link>
                    {index < additionalLinks.length - 1 && (
                      <span className="text-slate-400 dark:text-slate-500">
                        •
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {socialIcons.map((social) => (
              <Link
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-slate-500 dark:text-slate-400 sm:text-slate-700 sm:dark:text-slate-300 ${
                  social.color ||
                  "hover:text-slate-700 dark:hover:text-slate-300 sm:hover:text-slate-900 sm:dark:hover:text-slate-100"
                } transition-all duration-300 transform hover:scale-110 active:scale-95`}
                aria-label={social.label}
              >
                <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 flex items-center justify-center">
                  {social.icon}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
