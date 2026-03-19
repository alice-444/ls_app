import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, motion, useInView } from "framer-motion";

/**
 * RollingNumber
 * 
 * A component that animates a number rolling up to a target value.
 */

interface RollingNumberProps {
  value: number;
  direction?: "up" | "down";
  duration?: number;
  delay?: number;
  className?: string;
}

export default function RollingNumber({
  value,
  direction = "up",
  duration = 2,
  delay = 0,
  className = "",
}: RollingNumberProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px" });

  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
    }
  }, [motionValue, value, delay, isInView]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        (ref.current as HTMLElement).textContent = Intl.NumberFormat("en-US").format(
          Math.floor(latest)
        );
      }
    });
  }, [springValue]);

  return (
    <motion.span
      ref={ref}
      className={`inline-block tabular-nums ${className}`}
    />
  );
}
