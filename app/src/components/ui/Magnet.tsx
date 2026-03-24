import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * Magnet
 * 
 * A component that adds a magnetic hover effect to its children.
 */

interface MagnetProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export default function Magnet({ children, strength = 50, className = "" }: MagnetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / strength;
    const y = (clientY - (top + height / 2)) / strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.div>
  );
}
