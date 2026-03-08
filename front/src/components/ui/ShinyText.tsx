import React from 'react';

/**
 * ShinyText
 * 
 * A component that adds a "shiny" sweep effect to text.
 */

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`relative inline-block overflow-hidden bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 via-neutral-100 to-neutral-900 dark:from-neutral-100 dark:via-neutral-500 dark:to-neutral-100 ${className} ${disabled ? '' : 'animate-shiny'}`}
      style={{
        backgroundSize: '200% 100%',
        animationDuration: disabled ? '0s' : animationDuration,
      }}
    >
      {text}
      <style jsx>{`
        .animate-shiny {
          animation: shiny 5s linear infinite;
        }
        @keyframes shiny {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ShinyText;
