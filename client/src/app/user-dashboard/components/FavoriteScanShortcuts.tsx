'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface ScanShortcut {
  id: number;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface FavoriteScanShortcutsProps {
  shortcuts: ScanShortcut[];
  onNewScan?: () => void;
}

const FavoriteScanShortcuts = ({ shortcuts, onNewScan }: FavoriteScanShortcutsProps) => {
  // const router = useRouter(); // Removing router for SPA navigation logic

  const handleScanClick = (scanType: string) => {
    // In a fully integrated version, we would pass the scanType to onNewScan to pre-select it.
    // For now, we just navigate to the New Scan view.
    // router.push(`/scan-interface?type=${scanType.toLowerCase().replace(' ', '-')}`);
    if (onNewScan) {
        onNewScan();
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-headline font-bold text-foreground">Quick Scan</h2>
        <button className="text-sm text-primary hover:text-trust-blue font-medium transition-colors duration-300">
          Customize
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            onClick={() => handleScanClick(shortcut.name)}
            className={`${shortcut.color} rounded-lg p-4 text-left hover:shadow-brand transition-all duration-300 hover:-translate-y-1 group`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                <Icon name={shortcut.icon as any} size={24} variant="outline" className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-1">{shortcut.name}</h3>
                <p className="text-xs text-white/80">{shortcut.description}</p>
              </div>
              <Icon name="ArrowRightIcon" size={16} variant="outline" className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FavoriteScanShortcuts;