import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * DecryptedText
 * 
 * A component that simulates a "decrypting" effect for text.
 */

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover';
  [key: string]: any;
}

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = () => {
    let iteration = 0;
    setIsDecrypted(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setDisplayText((prevText) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (iteration >= maxIterations) {
               setIsDecrypted(true);
               if (timerRef.current) clearInterval(timerRef.current);
               return text[index];
            }
            if (sequential) {
                if (index < iteration / (maxIterations / text.length)) {
                    return text[index];
                }
            }
            
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iteration++;
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'view') {
      startAnimation();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, animateOn]);

  return (
    <motion.span
      className={parentClassName}
      onMouseEnter={() => {
        if (animateOn === 'hover') {
          setIsHovering(true);
          startAnimation();
        }
      }}
      onMouseLeave={() => {
        if (animateOn === 'hover') {
          setIsHovering(false);
        }
      }}
      {...props}
    >
      <span className={isDecrypted ? className : encryptedClassName}>
        {displayText}
      </span>
    </motion.span>
  );
}
