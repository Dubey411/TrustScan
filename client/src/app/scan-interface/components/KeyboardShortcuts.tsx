'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * KeyboardShortcuts Component
 * 
 * Accessible keyboard navigation system:
 * - Hotkeys for rapid portal operation: Ctrl/Cmd+Enter (Scan), Esc (Clear), ? (Help dialog)
 * - Visual key badge helper modal for pro power users
 */
interface KeyboardShortcutsProps {
  onScan: () => void;
  onClear: () => void;
}

export default function KeyboardShortcuts({ onScan, onClear }: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onScan();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClear();
      }
      
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isHydrated, onScan, onClear]);

  const shortcuts = [
    { keys: ['Ctrl', 'Enter'], description: 'Start scan', icon: 'PlayIcon' },
    { keys: ['Ctrl', 'K'], description: 'Clear input', icon: 'XMarkIcon' },
    { keys: ['?'], description: 'Toggle shortcuts', icon: 'QuestionMarkCircleIcon' },
  ];

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-6 right-6 p-3 bg-primary text-primary-foreground rounded-full shadow-brand-elevated hover:shadow-brand hover:-translate-y-1 transition-all duration-300 z-40"
        aria-label="Keyboard shortcuts"
      >
        <Icon name="CommandLineIcon" size={24} variant="outline" />
      </button>

      {isVisible && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsVisible(false)}>
          <div className="bg-card rounded-xl shadow-brand-elevated p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-headline font-bold text-foreground">Keyboard Shortcuts</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors duration-300"
                aria-label="Close shortcuts"
              >
                <Icon name="XMarkIcon" size={24} variant="outline" />
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon name={shortcut.icon as any} size={20} variant="outline" className="text-muted-foreground" />
                    <span className="text-foreground">{shortcut.description}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex}>
                        <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono font-medium">
                          {key}
                        </kbd>
                        {keyIndex < shortcut.keys.length - 1 && <span className="mx-1 text-muted-foreground">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start space-x-3">
                <Icon name="LightBulbIcon" size={20} variant="solid" className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  Press <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">?</kbd> anytime to toggle this menu
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}