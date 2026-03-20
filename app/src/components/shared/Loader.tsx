"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoaderProps {
  /** Full-screen centering (min-h-screen) for page loads */
  fullScreen?: boolean;
  /** Size: sm (modal), md (default), lg (page) */
  size?: "sm" | "md" | "lg";
  /** Optional message to display */
  message?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-32 w-32",
} as const;

export default function Loader({
  fullScreen = false,
  size = "md",
  message,
  className,
}: Readonly<LoaderProps>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullScreen && "min-h-[60vh] sm:min-h-[80vh]",
        className
      )}
    >
      <div className={cn("relative", sizeClasses[size])}>
        {/* Outer pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-ls-blue/10 border border-ls-blue/20"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Inner pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full bg-ls-blue/20 border border-ls-blue/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.2, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />

        {/* The core loader */}
        <motion.div
          className="absolute inset-0 rounded-full border-b-2 border-r-2 border-ls-blue shadow-[0_0_25px_-5px_rgba(59,130,246,0.4)]"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Center icon or dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-2 w-2 rounded-full bg-ls-blue"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-gradient-to-r from-ls-blue to-ls-blue/60 bg-clip-text text-transparent animate-pulse"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
