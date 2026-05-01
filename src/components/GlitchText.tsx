import { motion } from "motion/react";
import React, { useState, useEffect } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ text, className = "", speed = 100 }) => {
  const [displayText, setDisplayText] = useState(text);
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*()";

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, speed / 3);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <motion.span
      className={`inline-block relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      data-text={text}
    >
      {displayText}
      <span className="absolute top-0 left-0 -ml-[1px] text-neon-magenta opacity-70 animate-[glitch_0.3s_infinite] pointer-events-none z-[-1]">
        {displayText}
      </span>
      <span className="absolute top-0 left-0 ml-[1px] text-[#0000ff] opacity-70 animate-[glitch_0.5s_infinite] pointer-events-none z-[-1]">
        {displayText}
      </span>
    </motion.span>
  );
};
