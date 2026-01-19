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
    if (!isPremium) return;
    
    setIsDownloading(true);
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      // In real implementation, this would trigger actual PDF download
      alert('PDF report downloaded successfully!');
    }, 2000);
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="DocumentArrowDownIcon" size={24} variant="solid" className="text-primary" />
        <h3 className="text-xl font-headline font-bold text-foreground">Download Report</h3>
      </div>
      
      {isPremium ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Download a comprehensive PDF report with detailed analysis, recommendations, and educational resources.
          </p>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-headline font-semibold hover:bg-trust-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Download PDF report"
          >
            {isDownloading ? (
              <>
                <Icon name="ArrowPathIcon" size={20} variant="outline" className="animate-spin" />
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Icon name="ArrowDownTrayIcon" size={20} variant="outline" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-muted border border-border rounded-md p-4">
            <div className="flex items-start space-x-3">
              <Icon name="LockClosedIcon" size={20} variant="solid" className="text-warning mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Premium Feature</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to premium to download detailed PDF reports with comprehensive analysis and recommendations.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/pricing-page'}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-headline font-semibold hover:opacity-90 transition-all duration-300"
            aria-label="Upgrade to premium"
          >
            <Icon name="SparklesIcon" size={20} variant="solid" />
            <span>Upgrade to Premium</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DownloadReport;