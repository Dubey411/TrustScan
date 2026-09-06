'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface QuickScanSectionProps {
  isVisible: boolean;
  onClose: () => void;
}

const QuickScanSection = ({ isVisible, onClose }: QuickScanSectionProps) => {
  const [scanType, setScanType] = useState<'document' | 'payment' | 'image' | 'company'>('payment');
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    if (!inputValue.trim()) return;
    
    setIsScanning(true);
    
    setTimeout(() => {
      setIsScanning(false);
      window.location.href = '/scan-interface';
    }, 1200);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#161922] border border-white/[0.12] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.8)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/15 border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A]">
              <Icon name="MagnifyingGlassIcon" size={18} />
            </div>
            <div>
              <h2 className="text-xl font-headline font-semibold text-white">Quick Forensic Scanner</h2>
              <p className="text-xs font-mono text-muted-foreground">Select artifact type & initiate live audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
            aria-label="Close scan modal"
          >
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>

        {/* Scan Type Selection */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setScanType('payment')}
              className={`flex flex-col items-center space-y-2 p-3.5 rounded-xl border transition-all duration-200 ${
                scanType === 'payment'
                  ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-white shadow-[0_0_16px_rgba(255,107,74,0.2)]'
                  : 'border-white/[0.08] bg-[#0A0B0F]/40 text-muted-foreground hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon
                name="CreditCardIcon"
                size={24}
                className={scanType === 'payment' ? 'text-[#FF6B4A]' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-center">UPI & Payment</span>
            </button>

            <button
              onClick={() => setScanType('document')}
              className={`flex flex-col items-center space-y-2 p-3.5 rounded-xl border transition-all duration-200 ${
                scanType === 'document'
                  ? 'border-[#818CF8] bg-[#818CF8]/10 text-white shadow-[0_0_16px_rgba(129,140,248,0.2)]'
                  : 'border-white/[0.08] bg-[#0A0B0F]/40 text-muted-foreground hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon
                name="DocumentCheckIcon"
                size={24}
                className={scanType === 'document' ? 'text-[#818CF8]' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-center">Offer Letter</span>
            </button>

            <button
              onClick={() => setScanType('company')}
              className={`flex flex-col items-center space-y-2 p-3.5 rounded-xl border transition-all duration-200 ${
                scanType === 'company'
                  ? 'border-[#FBBF24] bg-[#FBBF24]/10 text-white shadow-[0_0_16px_rgba(251,191,36,0.2)]'
                  : 'border-white/[0.08] bg-[#0A0B0F]/40 text-muted-foreground hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon
                name="BuildingOffice2Icon"
                size={24}
                className={scanType === 'company' ? 'text-[#FBBF24]' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-center">Company & CIN</span>
            </button>

            <button
              onClick={() => setScanType('image')}
              className={`flex flex-col items-center space-y-2 p-3.5 rounded-xl border transition-all duration-200 ${
                scanType === 'image'
                  ? 'border-[#4ADE80] bg-[#4ADE80]/10 text-white shadow-[0_0_16px_rgba(74,222,128,0.2)]'
                  : 'border-white/[0.08] bg-[#0A0B0F]/40 text-muted-foreground hover:border-white/20 hover:text-white'
              }`}
            >
              <Icon
                name="PhotoIcon"
                size={24}
                className={scanType === 'image' ? 'text-[#4ADE80]' : 'text-muted-foreground'}
              />
              <span className="text-xs font-semibold text-center">AI Image Forensics</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {scanType === 'payment' && 'Enter UPI Reference, 12-digit UTR, or Payment Receipt Text'}
              {scanType === 'document' && 'Paste Offer Letter Text, HR Email, or CTC Salary Terms'}
              {scanType === 'company' && 'Enter Company Name, 21-digit MCA CIN, or GSTIN'}
              {scanType === 'image' && 'Enter Image Description, Model Generation Prompt, or ELA File Info'}
            </label>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                scanType === 'payment' ? 'Example: Paid ₹4,500 via PhonePe/GPay, UTR: 429188291034, VPA: merchant@okaxis...'
                  : scanType === 'document' ? 'Example: Offer letter from ABC Corp, CTC 12 LPA, requested ₹5,000 laptop security deposit...'
                  : scanType === 'company' ? 'Example: U72900MH2020PTC123456, 27AAAAA0000A1Z5, or Infosys Limited...'
                  : 'Example: Midjourney v6 render, Stable Diffusion XL prompt metadata, or photo artifact...'
              }
              className="w-full h-32 px-4 py-3 bg-[#0A0B0F] border border-white/[0.1] rounded-xl text-white font-mono text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] resize-none"
            />
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!inputValue.trim() || isScanning}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#FF6B4A] text-white rounded-xl font-headline font-semibold text-base hover:bg-[#FF7A5C] transition-all duration-300 shadow-[0_0_20px_rgba(255,107,74,0.35)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-mono text-sm">Executing Invariant Gates...</span>
              </>
            ) : (
              <>
                <Icon name="ShieldCheckIcon" size={20} variant="solid" />
                <span>Execute Forensic Audit</span>
              </>
            )}
          </button>

          {/* Confidentiality Notice */}
          <div className="flex items-start space-x-3 p-3.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-xs font-mono text-muted-foreground">
            <Icon name="InformationCircleIcon" size={18} className="text-[#FF6B4A] flex-shrink-0 mt-0.5" />
            <p>
              100% sovereign & confidential. Artifacts are analyzed in memory with zero permanent data retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickScanSection;