'use client';

import React from 'react';
import ScanInterfaceInteractive from '@/app/scan-interface/components/ScanInterfaceInteractive';
import ResultsInteractive from '@/app/results-dashboard/components/ResultsInteractive';
import Icon from '@/components/ui/AppIcon';

import DashboardInteractive from '../DashboardInteractive';

interface MainContentProps {
  currentView: 'overview' | 'new' | 'result';
  onScanComplete: (data: { id: string | number; type: string; target: string; apiResult?: any }) => void;
  isSidebarOpen?: boolean; // Make optional as sidebar is gone
  onToggleSidebar?: () => void;
  activeScan?: {
    id: string | number;
    target: string;
    result: 'safe' | 'risky' | 'scam';
    date: string;
    time: string;
    confidence?: number;
    flags?: any;
    signals?: any;
    scanMeta?: any;
  };
  dashboardProps?: any;
  onGoHome?: () => void;
  onNewScan: () => void;
  onSelectScan: (id: number | string) => void;
}

const MainContent = ({
  currentView,
  onScanComplete,
  // isSidebarOpen,
  // onToggleSidebar,
  activeScan,
  dashboardProps,
  onGoHome,
  onNewScan,
  onSelectScan
}: MainContentProps) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
      {/* Header with Back Button if not in overview */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
             {currentView !== 'overview' && onGoHome && (
                <button 
                    onClick={onGoHome}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                    <Icon name="ArrowLeftIcon" size={20} />
                </button>
             )}
            <span className="font-headline font-semibold text-foreground text-lg">
                {currentView === 'overview' ? 'Dashboard' : 
                 currentView === 'new' ? 'New Scan' : 'Scan Analysis'}
            </span>
        </div>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth p-6 lg:p-8">
        <div className="max-w-7xl mx-auto min-h-full">
            {currentView === 'overview' && dashboardProps ? (
                <div className="pb-20 animate-fade-in-up">
                    <DashboardInteractive 
                      {...dashboardProps} 
                      onNewScan={onNewScan}
                      onSelectScan={onSelectScan}
                    />
                </div>
            ) : currentView === 'new' ? (
                // Wrapper to constrain scanning interface width and center it
                <div className="max-w-4xl mx-auto w-full pb-20 animate-fade-in-up">
                    <ScanInterfaceInteractive onScanComplete={onScanComplete} />
                </div>
            ) : (
                // Result View
                <div className="h-full animate-fade-in-up">
                     <ResultsInteractive scanData={activeScan} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
