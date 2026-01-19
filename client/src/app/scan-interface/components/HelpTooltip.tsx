'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpTooltip({ content, position = 'top' }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="p-1 hover:bg-muted rounded-full transition-colors duration-300"
        aria-label="Help information"
        type="button"
      >
        <Icon name="QuestionMarkCircleIcon" size={20} variant="outline" className="text-muted-foreground" />
      </button>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} w-64 pointer-events-none`}>
          <div className="bg-foreground text-background p-3 rounded-lg shadow-brand text-sm">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}