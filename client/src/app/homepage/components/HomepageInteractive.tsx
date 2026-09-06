'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import BackgroundLayers from './BackgroundLayers';
import ScanInterfaceInteractive from '../../scan-interface/components/ScanInterfaceInteractive';
import HowItWorksSection from './HowItWorksSection';
import PricingInteractive from '../../pricing-page/components/PricingInteractive';
import FooterSection from './FooterSection';
import QuickScanSection from './QuickScanSection';

const HomepageInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showQuickScan, setShowQuickScan] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            Loading TrustScan AI...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/30 selection:text-white">
      {/* Fixed Ambient Background Layers */}
      <BackgroundLayers />

      {/* Sovereign Navigation Header */}
      <Header />

      {/* Main Interactive App Area */}
      <main className="pt-20 pb-12 relative z-10">
        <>
          {/* Scanner — results display in-place via ScanProgress overlay, no redirect */}
          <ScanInterfaceInteractive />

          {/* How It Works Section */}
          <HowItWorksSection />

          {/* Pricing Section */}
          <PricingInteractive />
        </>
      </main>

      {/* Sovereign Footer */}
      <FooterSection />

      {/* Quick Scan Modal */}
      <QuickScanSection isVisible={showQuickScan} onClose={() => setShowQuickScan(false)} />
    </div>
  );
};

export default HomepageInteractive;