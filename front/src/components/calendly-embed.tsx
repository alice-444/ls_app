"use client";

import { useEffect, useRef } from "react";

interface CalendlyEmbedProps {
  url: string;
  height?: string;
}

export function CalendlyEmbed({ url, height = "600px" }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const urlMatch = url.match(/calendly\.com\/([^/]+)/);
    if (!urlMatch) return;

    const username = urlMatch[1];

    if (!document.querySelector('script[src*="calendly"]')) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const embedUrl = `https://calendly.com/${username}`;

    containerRef.current.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.width = "100%";
    iframe.height = height;
    iframe.frameBorder = "0";
    iframe.style.border = "none";
    containerRef.current.appendChild(iframe);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [url, height]);

  if (!url || !url.includes("calendly.com")) {
    return (
      <div className="p-4 text-center text-gray-500 border rounded-lg">
        Lien Calendly invalide
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
