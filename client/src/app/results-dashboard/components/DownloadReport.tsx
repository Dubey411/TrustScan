'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DownloadReportProps {
  isPremium: boolean;
  scanId: string;
}

const DownloadReport = ({ isPremium, scanId }: DownloadReportProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (!isPremium) {
      window.location.href = '/pricing-page';
      return;
    }
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Icon name="DocumentArrowDownIcon" size={20} className="text-primary" />
        </div>
        <span className="text-sm font-semibold text-white">Download Report</span>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isPremium
            ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(255,107,74,0.2)]'
            : 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24] hover:bg-[#FBBF24]/20'
        }`}
        aria-label={isPremium ? 'Download PDF report' : 'Upgrade to download report'}
      >
        {isDownloading ? (
          <>
            <Icon name={isDownloading ? 'ArrowPathIcon' : 'ArrowDownTrayIcon'} size={20} className={isDownloading ? 'animate-spin' : ''} />
            <span>Generating...</span>
          </>
        ) : isPremium ? (
          <>
            <Icon name="ArrowDownTrayIcon" size={20} />
            <span>Download PDF Report</span>
          </>
        ) : (
          <>
            <Icon name="SparklesIcon" size={16} />
            <span>Upgrade to Download</span>
          </>
        )}
      </button>

      {!isPremium && (
        <p className="text-[11px] text-muted-foreground/60 font-mono text-center">
          Premium includes full forensic PDF with all signals
        </p>
      )}
    </div>
  );
};

export default DownloadReport;