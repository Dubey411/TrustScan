'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import Icon from '@/components/ui/AppIcon';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-muted transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <span className="absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-foreground">
           <Icon name="SunIcon" size={20} variant="outline" />
        </span>
        <span className="absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-foreground">
          <Icon name="MoonIcon" size={20} variant="outline" />
        </span>
      </div>
    </button>
  );
}
