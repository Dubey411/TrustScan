'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * TextInputArea Component
 * 
 * Multi-line textual payload input for suspicious SMS, email, or CIN entries:
 * - Live dynamic character counter with warning thresholds
 * - Keyboard shortcut support (Ctrl+Enter / Cmd+Enter to scan)
 * - Clear button for rapid input resets
 */
interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength: number;
  onScan?: () => void;
}

export default function TextInputArea({ value, onChange, placeholder, maxLength, onScan }: TextInputAreaProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const characterCount = isHydrated ? value.length : 0;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={8}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (onScan) onScan();
            }
          }}
          className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none font-body text-foreground placeholder:text-muted-foreground"
          aria-label="Scan input text area"
        />
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <Icon name="DocumentTextIcon" size={20} variant="outline" className="text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Enter text to scan for potential fraud</span>
        <span className={`font-medium ${isNearLimit ? 'text-warning' : 'text-muted-foreground'}`}>
          {characterCount} / {maxLength}
        </span>
      </div>
    </div>
  );
}