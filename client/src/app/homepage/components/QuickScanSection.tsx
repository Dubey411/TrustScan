'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickScanSectionProps {
  isVisible: boolean;
  onClose: () => void;
}

const QuickScanSection = ({ isVisible, onClose }: QuickScanSectionProps) => {
  const [scanType, setScanType] = useState<'job' | 'link' | 'message'>('job');
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (!inputValue.trim()) return;
    
    setIsScanning(true);
    
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      window.location.href = '/results-dashboard';
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-brand-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-headline font-bold text-foreground">Quick Scan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors duration-300"
            aria-label="Close scan modal"
          >
            <Icon name="XMarkIcon" size={24} variant="outline" />
          </button>
        </div>

        {/* Scan Type Selection */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setScanType('job')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'job' ?'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="BriefcaseIcon"
                size={32}
                variant={scanType === 'job' ? 'solid' : 'outline'}
                className={scanType === 'job' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-sm font-medium text-foreground">Check Offer Letter</span>
            </button>

            <button
              onClick={() => setScanType('link')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'link' ?'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="LinkIcon"
                size={32}
                variant={scanType === 'link' ? 'solid' : 'outline'}
                className={scanType === 'link' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-sm font-medium text-foreground">Check Link Safety</span>
            </button>

            <button
              onClick={() => setScanType('message')}
              className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'message' ?'border-primary bg-primary/5' :'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="ChatBubbleLeftRightIcon"
                size={32}
                variant={scanType === 'message' ? 'solid' : 'outline'}
                className={scanType === 'message' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-sm font-medium text-foreground">Check Message</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              {scanType === 'job' && 'Paste job offer details or description'}
              {scanType === 'link' && 'Enter suspicious link or URL'}
              {scanType === 'message' && 'Paste WhatsApp/Email message content'}
            </label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                scanType === 'job' ?'Example: We are hiring for Software Developer position with ₹50,000 salary...'
                  : scanType === 'link' ?'Example: https://suspicious-job-portal.com/apply'
                  : 'Example: Congratulations! You have been selected for...'
              }
              className="w-full h-40 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!inputValue.trim() || isScanning}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-headline font-semibold text-lg hover:bg-trust-blue hover:shadow-brand hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isScanning ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Icon name="ShieldCheckIcon" size={24} variant="solid" />
                <span>Scan for Fraud</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-primary mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your scan is completely free and confidential. Results will be available instantly with detailed fraud analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickScanSection;