"use client";

import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface FloatingAddButtonProps {
  readonly onClick: () => void;
}

const PARTICLE_COUNT = 6;

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <>
      <div className="particle-container">
        {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>
      <Button
        onClick={onClick}
        size="lg"
        className="group floating-add-button fixed bottom-6 right-6 md:bottom-8 md:right-8 z-100 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center p-0 text-white border-0 hover:scale-125 active:scale-90"
        style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 100 }}
        aria-label="Créer un atelier"
        title="Créer un atelier"
      >
        <Plus
          className="icon-plus w-5 h-5 sm:w-7 sm:h-7 transition-all duration-500 group-hover:rotate-180 group-hover:scale-125 relative z-10"
          style={{
            filter:
              "drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 10px rgba(255, 140, 66, 0.6))",
          }}
        />
      </Button>
    </>
  );
}
