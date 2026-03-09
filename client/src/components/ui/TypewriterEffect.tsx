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
    // Reset when content changes
    setDisplayedText("");
    setIsTyping(true);
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedText(content.slice(0, currentIndex + 1));
        currentIndex++;
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
      {isTyping && <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse align-middle" />}
    </span>
  );
};
