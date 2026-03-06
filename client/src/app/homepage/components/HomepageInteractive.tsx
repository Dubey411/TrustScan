'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import ScanInterfaceInteractive from '../../scan-interface/components/ScanInterfaceInteractive';
import ResultsInteractive from '../../results-dashboard/components/ResultsInteractive';
import PricingInteractive from '../../pricing-page/components/PricingInteractive';
import Icon from '@/components/ui/AppIcon';

import QuickScanSection from './QuickScanSection';
import HowItWorksSection from './HowItWorksSection';
import FooterSection from './FooterSection';

const HomepageInteractive = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showQuickScan, setShowQuickScan] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);


  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleScanClick = () => {
    setShowQuickScan(true);
  };

  const handleCloseScan = () => {
    setShowQuickScan(false);
  };

  const handleScanComplete = (data: any) => {
    // Transform data to match ResultsInteractive expectation if needed
    // The ScanInterfaceInteractive returns: { type, target, apiResult }
    // ResultsInteractive expects: { id, target, result, confidence, date, reasons }
    
    const formattedResult = {
        ...data.apiResult, // Spread all API fields first
        id: data.id || data.apiResult?.id || data.apiResult?._id || `guest-${Date.now()}`,
        target: data.target,
        result: data.apiResult?.status || 'safe',
        confidence: data.apiResult?.riskScore || 0,
        date: new Date().toLocaleDateString(),
        scanType: data.type
    };
    
    setScanResult(formattedResult);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetScan = () => {
    setScanResult(null);
  };


  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          <div className="h-16 bg-muted"></div>
          <div className="h-96 bg-muted/50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {scanResult ? (
            <div className="container mx-auto px-4 py-8 animate-fade-in-up">
                <button 
                    onClick={handleResetScan}
                    className="flex items-center gap-2 mb-6 px-4 py-2 text-primary font-semibold hover:bg-primary/10 rounded-lg transition-colors"
                >
                    <Icon name="ArrowLeftIcon" size={20} />
                    Back to Scanner
                </button>
                <ResultsInteractive scanData={scanResult} />
            </div>
        ) : (
            <>
                <ScanInterfaceInteractive onScanComplete={handleScanComplete} />
                <HowItWorksSection />
                <PricingInteractive />
            </>
        )}
      </main>

      <FooterSection />
      <QuickScanSection isVisible={showQuickScan} onClose={handleCloseScan} />
    </div>
  );
};

export default HomepageInteractive;