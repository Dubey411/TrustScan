'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import Icon from '@/components/ui/AppIcon';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 p-2 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground ${className}`}>
        <Icon name="MoonIcon" size={16} />
      </div>
    );
  }

  const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2 rounded-lg bg-card hover:bg-muted border border-border text-foreground hover:text-primary transition-all duration-200 cursor-pointer shadow-sm ${className}`}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Icon name="SunIcon" size={17} className="text-amber-400" />
        ) : (
          <Icon name="MoonIcon" size={17} className="text-indigo-600" />
        )}
      </div>
    </button>
  );
}
