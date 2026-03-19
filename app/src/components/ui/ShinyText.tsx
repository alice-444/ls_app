import React from "react";

/**
 * ShinyText
 *
 * A component that adds a "shiny" sweep effect to text.
 * Uses brand colors for LearnSup compatibility.
 */

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = "",
}) => {
  return (
    <span
      className={`relative inline-block overflow-hidden bg-clip-text text-transparent bg-gradient-to-r from-[#26547c] via-[#FFB647] to-[#26547c] dark:from-[#e6e6e6] dark:via-[#FFB647] dark:to-[#e6e6e6] ${className} ${disabled ? "" : "animate-shiny-text"}`}
      style={{
        backgroundSize: "200% 100%",
        animationDuration: disabled ? "0s" : `${speed}s`,
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
