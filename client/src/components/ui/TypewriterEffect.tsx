import React, { useState, useEffect } from 'react';

/**
 * TypewriterEffect
 * Animates text to appear character by character, like ChatGPT printing answers.
 */
interface TypewriterEffectProps {
  content: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  content, 
  speed = 10, 
  className = "",
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Convert string to array of characters (handles multi-byte glyphs/emojis correctly)
    const chars = Array.from(content);
    setDisplayedText("");
    setIsTyping(true);
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < chars.length) {
        // Optimization: If the next characters are whitespace, skip ahead to avoid perceived "stuck" behavior
        let nextIndex = currentIndex + 1;
        while (nextIndex < chars.length && /\s/.test(chars[nextIndex]) && nextIndex - currentIndex < 5) {
          nextIndex++;
        }
        
        setDisplayedText(chars.slice(0, nextIndex).join(""));
        currentIndex = nextIndex;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [content, speed]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-1 h-4 ml-0.5 bg-indigo-500 animate-pulse align-middle shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
      )}
    </span>
  );
};
