'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  scans: Array<{
    id: number;
    target: string;
    date: string;
    result: 'safe' | 'risky' | 'scam';
  }>;
  currentView: 'overview' | 'new' | 'result';
  onNewScan: () => void;
  onSelectScan: (id: number) => void;
  activeScanId?: number;
  onGoHome?: () => void;
}

const Sidebar = ({
  isOpen,
  onClose,
  scans,
  currentView,
  onNewScan,
  onSelectScan,
  activeScanId,
  onGoHome,
}: SidebarProps) => {
  const [visibleCount, setVisibleCount] = React.useState(10);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header / New Chat */}
          <div className="p-4 border-b border-border space-y-3">
             <button
              onClick={() => {
                if (onGoHome) onGoHome();
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
                currentView === 'overview'
                  ? 'bg-primary/10 text-primary border-primary/20'
                  : 'bg-transparent text-foreground border-transparent hover:bg-muted'
              }`}
            >
              <Icon name="Squares2X2Icon" size={20} variant={currentView === 'overview' ? 'solid' : 'outline'} />
              <span className="font-headline font-semibold">Dashboard</span>
            </button>
            <button
              onClick={() => {
                onNewScan();
                if (window.innerWidth < 1024) onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
                currentView === 'new'
                  ? 'bg-primary text-primary-foreground border-primary shadow-brand'
                  : 'bg-muted/50 text-foreground border-transparent hover:bg-muted hover:border-border'
              }`}
            >
              <div className={`p-1 rounded-lg ${currentView === 'new' ? 'bg-white/20' : 'bg-background'}`}>
                  <Icon name="PlusIcon" size={18} variant="solid" className={currentView === 'new' ? 'text-white' : 'text-primary'} />
              </div>
              <span className="font-headline font-semibold">New Scan</span>
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">
              Recent Scans
            </h3>
            <div className="space-y-2">
              {scans.slice(0, visibleCount).map((scan) => (
                <button
                  key={scan.id}
                  onClick={() => {
                    onSelectScan(scan.id);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden ${
                    activeScanId === scan.id
                      ? 'bg-muted text-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                     <Icon 
                        name={scan.result === 'safe' ? 'CheckCircleIcon' : scan.result === 'scam' ? 'XCircleIcon' : 'ExclamationTriangleIcon'} 
                        size={16} 
                        className={scan.result === 'safe' ? 'text-success-green' : scan.result === 'scam' ? 'text-error' : 'text-warning'}
                        variant="solid"
                     />
                    <span className="truncate flex-1">{scan.target}</span>
                  </div>
                  {activeScanId === scan.id && (
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg animate-pulse" />
                  )}
                </button>
              ))}
              
              {visibleCount < scans.length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  className="w-full py-2 text-xs text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors mt-2 flex items-center justify-center gap-1"
                >
                  <Icon name="ArrowDownCircleIcon" size={14} />
                  Load Older History ({scans.length - visibleCount} more)
                </button>
              )}
            </div>
          </div>

          {/* Footer / User Profile User */}
          <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      PS
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">Priya Sharma</p>
                      <p className="text-xs text-muted-foreground truncate">Free Plan</p>
                  </div>
                  <Icon name="Cog6ToothIcon" size={18} className="text-muted-foreground" />
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
