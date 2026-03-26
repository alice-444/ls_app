"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTopButton() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Try multiple methods to detect scroll
      const mainElement = document.querySelector("main");
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const mainScrollTop = mainElement?.scrollTop || 0;

      // Use the larger value to be safe
      const totalScroll = Math.max(scrollY, mainScrollTop);
      setShowScrollTop(totalScroll > 100);
    };

    // Check initial scroll position
    handleScroll();

    // Listen to both window and main element scroll
    window.addEventListener("scroll", handleScroll, { passive: true });
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll, { passive: true });
    }

    // Also check periodically in case scroll events are missed
    const interval = setInterval(handleScroll, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes scrollTopParticle1 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translate(2px, -2px) scale(0.3);
          }
          50% {
            opacity: 0.8;
            transform: translate(20px, -25px) scale(0.8);
          }
          100% {
            transform: translate(40px, -50px) scale(1);
            opacity: 0;
          }
        }
        @keyframes scrollTopParticle2 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translate(-2px, -2px) scale(0.3);
          }
          50% {
            opacity: 0.8;
            transform: translate(-22px, -20px) scale(0.8);
          }
          100% {
            transform: translate(-45px, -40px) scale(1);
            opacity: 0;
          }
        }
        @keyframes scrollTopParticle3 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translate(2px, 2px) scale(0.3);
          }
          50% {
            opacity: 0.8;
            transform: translate(17px, 22px) scale(0.8);
          }
          100% {
            transform: translate(35px, 45px) scale(1);
            opacity: 0;
          }
        }
        @keyframes scrollTopParticle4 {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
            transform: translate(-2px, 2px) scale(0.3);
          }
          50% {
            opacity: 0.8;
            transform: translate(-17px, 25px) scale(0.8);
          }
          100% {
            transform: translate(-35px, 50px) scale(1);
            opacity: 0;
          }
        }
        @keyframes scrollTopFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        @keyframes scrollTopPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 140, 66, 0.6),
                        0 0 0 0 rgba(255, 182, 71, 0.6),
                        0 0 20px rgba(255, 140, 66, 0.4);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(255, 140, 66, 0),
                        0 0 0 24px rgba(255, 182, 71, 0),
                        0 0 30px rgba(255, 140, 66, 0.7);
          }
        }
        @keyframes scrollTopShimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }
        @keyframes rotate-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .scroll-top-button {
          background: linear-gradient(135deg, #FF8C42 0%, #FFB647 50%, #FF8C42 100%);
          background-size: 200% 200%;
          position: relative;
          overflow: visible;
          animation: scrollTopFloat 3s ease-in-out infinite;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }
        .scroll-top-button::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FFB647, #FF8C42, #FFB647, #FF8C42);
          background-size: 400% 400%;
          animation: rotate-gradient 3s ease infinite;
          opacity: 0.6;
          z-index: -1;
          filter: blur(6px);
        }
        .scroll-top-button::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          background-size: 200% 100%;
          animation: scrollTopShimmer 2s infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .scroll-top-button:hover {
          transform: scale(1.15);
          animation: scrollTopFloat 3s ease-in-out infinite, scrollTopPulse 1.5s ease-in-out infinite;
        }
        .scroll-top-button:hover::after {
          opacity: 1;
        }
        .scroll-top-button:hover::before {
          opacity: 0.9;
          filter: blur(10px);
        }
        .scroll-top-button:active {
          transform: scale(0.9);
        }
        .scroll-top-particle {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          top: 50%;
          left: 50%;
          will-change: transform, opacity;
          transform-origin: center;
        }
        .scroll-top-particle-1 {
          background: radial-gradient(circle, rgba(255, 140, 66, 0.9), rgba(255, 140, 66, 0.3));
          box-shadow: 0 0 8px rgba(255, 140, 66, 0.6);
          animation: scrollTopParticle1 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .scroll-top-particle-2 {
          background: radial-gradient(circle, rgba(255, 182, 71, 0.9), rgba(255, 182, 71, 0.3));
          box-shadow: 0 0 8px rgba(255, 182, 71, 0.6);
          animation: scrollTopParticle2 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .scroll-top-particle-3 {
          background: radial-gradient(circle, rgba(255, 140, 66, 0.8), rgba(255, 140, 66, 0.2));
          box-shadow: 0 0 6px rgba(255, 140, 66, 0.5);
          animation: scrollTopParticle3 3.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .scroll-top-particle-4 {
          background: radial-gradient(circle, rgba(255, 182, 71, 0.8), rgba(255, 182, 71, 0.2));
          box-shadow: 0 0 6px rgba(255, 182, 71, 0.5);
          animation: scrollTopParticle4 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .scroll-top-button:hover .scroll-top-particle {
          animation-duration: 1.5s;
          width: 6px;
          height: 6px;
        }
        .scroll-top-container {
          position: fixed;
          bottom: 6rem;
          right: 1.5rem;
          z-index: 101;
          width: 48px;
          height: 48px;
          pointer-events: none;
          will-change: opacity;
        }
        @media (min-width: 768px) {
          .scroll-top-container {
            bottom: 7rem;
            right: 2rem;
          }
        }
      `}</style>
      <div className={`scroll-top-container transition-opacity duration-300 ${showScrollTop ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="scroll-top-particle scroll-top-particle-1"></div>
        <div className="scroll-top-particle scroll-top-particle-2"></div>
        <div className="scroll-top-particle scroll-top-particle-3"></div>
        <div className="scroll-top-particle scroll-top-particle-4"></div>
      </div>
      <Button
        onClick={() => {
          const mainElement = document.querySelector("main");
          if (mainElement) {
            mainElement.scrollTo({ top: 0, behavior: "smooth" });
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
          document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={`scroll-top-button group fixed z-[101] h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl dark:shadow-2xl transition-all duration-500 flex items-center justify-center p-0 text-white border-0 ${showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto visible"
            : "opacity-0 translate-y-4 pointer-events-none invisible"
          }`}
        style={{
          position: "fixed",
          bottom: "6rem",
          right: "1.5rem",
          zIndex: 9999,
        }}
        aria-label="Remonter en haut"
        title="Remonter en haut"
      >
        <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-1"
          style={{
            filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(255, 140, 66, 0.7))",
          }}
        />
      </Button>
    </>
  );
}
