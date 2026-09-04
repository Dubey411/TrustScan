'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickScanSectionProps {
  isVisible: boolean;
  onClose: () => void;
}

const QuickScanSection = ({ isVisible, onClose }: QuickScanSectionProps) => {
  const [scanType, setScanType] = useState<'document' | 'academic' | 'payment' | 'company' | 'image'>('document');
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (!inputValue.trim()) return;
    
    setIsScanning(true);
    
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      window.location.href = '/scan-interface';
    }, 1500);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-brand-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-headline font-bold text-foreground">Quick Document & Fraud Scan</h2>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setScanType('document')}
              className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'document' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="DocumentCheckIcon"
                size={28}
                variant={scanType === 'document' ? 'solid' : 'outline'}
                className={scanType === 'document' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-foreground text-center">Offer Letter</span>
            </button>

            <button
              onClick={() => setScanType('payment')}
              className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'payment' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="CreditCardIcon"
                size={28}
                variant={scanType === 'payment' ? 'solid' : 'outline'}
                className={scanType === 'payment' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-foreground text-center">UPI & Payment</span>
            </button>

            <button
              onClick={() => setScanType('image')}
              className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'image' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="PhotoIcon"
                size={28}
                variant={scanType === 'image' ? 'solid' : 'outline'}
                className={scanType === 'image' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-foreground text-center">AI Image Detection</span>
            </button>

            <button
              onClick={() => setScanType('company')}
              className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-all duration-300 ${
                scanType === 'company' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Icon
                name="BuildingOffice2Icon"
                size={28}
                variant={scanType === 'company' ? 'solid' : 'outline'}
                className={scanType === 'company' ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-foreground text-center">Company & CIN</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground">
              {scanType === 'company' && 'Enter Company Name, 21-digit MCA CIN, or GSTIN'}
              {scanType === 'document' && 'Paste offer letter text, contract excerpt, or credentials'}
              {scanType === 'payment' && 'Enter UPI ID, 12-digit UTR reference, or transaction details'}
              {scanType === 'image' && 'Upload any image or paste text to test for AI Generation & pixel tampering'}
            </label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                scanType === 'company' ? 'Example: Tata Consultancy Services, U72900MH2020PTC123456, or 27AAAAA0000A1Z5...'
                  : scanType === 'document' ? 'Example: Paste offer letter joining dates, CTC compensation, HR signature info...'
                  : scanType === 'payment' ? 'Example: Paid to user@okhdfcbank, UTR: 328901928392, Amount: ₹50,000, Status: Successful...'
                  : 'Example: Upload an image file or enter image details to scan for AI Generation (Stable Diffusion, Midjourney, DALL-E)...'
              }
              className="w-full h-36 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
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