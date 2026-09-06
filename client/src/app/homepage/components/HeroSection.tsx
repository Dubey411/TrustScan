'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface HeroSectionProps {
  onScanClick: () => void;
}

const HeroSection = ({ onScanClick }: HeroSectionProps) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Centered Hero Intro */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#161922] border border-white/[0.08] shadow-[0_0_20px_rgba(255,107,74,0.15)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B4A]"></span>
            </span>
            <span className="text-xs font-mono font-medium text-foreground tracking-wide">
              New · India's Smartest AI Fraud & Credential Engine
            </span>
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-headline font-semibold tracking-[-0.03em] leading-[1.08] text-white">
            Verify Offers, Payments, <br className="hidden sm:inline" />
            <span className="text-gradient-sovereign font-bold">
              Images & Companies
            </span>
          </h1>

          {/* Subtext Paragraph */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto font-body leading-relaxed">
            Multi-modal fraud intelligence engineered for Indian job seekers, enterprises, and institutions. Detect fake offer letters, manipulated UPI receipts, forged CINs, and synthetic images in milliseconds.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={onScanClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-base text-white bg-[#FF6B4A] hover:bg-[#FF7A5C] transition-all duration-300 shadow-[0_0_28px_rgba(255,107,74,0.4)] hover:shadow-[0_0_36px_rgba(255,107,74,0.6)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <Icon name="MagnifyingGlassIcon" size={20} className="text-white" />
              <span>Scan Now — Free</span>
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-medium text-base text-foreground bg-[#161922] hover:bg-[#1C202B] border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>How It Works</span>
              <Icon name="ArrowDownIcon" size={18} className="text-muted-foreground" />
            </a>
          </div>

          {/* Stats Row with Gradient Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 max-w-2xl mx-auto border-t border-white/[0.06]">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-headline font-bold text-gradient-coral">
                100K+
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                Docs Verified
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-headline font-bold text-gradient-indigo">
                50K+
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                Entities Checked
              </div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-3xl sm:text-4xl font-headline font-bold text-gradient-green">
                99.2%
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                Forensic Accuracy
              </div>
            </div>
          </div>
        </div>

        {/* Scan Dashboard Mockup Card with Browser Chrome Bar */}
        <div className="mt-14 max-w-5xl mx-auto relative">
          {/* Floating Tag 1: Top Left - Bobbing */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161922]/90 border border-red-500/30 shadow-[0_8px_24px_rgba(239,68,68,0.2)] backdrop-blur-md absolute -top-5 -left-8 z-20 animate-float-bob">
            <span className="flex h-2 w-2 rounded-full bg-red-400" />
            <span className="text-xs font-mono font-medium text-red-300">
              UTR Fraud Detected
            </span>
          </div>

          {/* Floating Tag 2: Top Right - Bobbing */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161922]/90 border border-[#4ADE80]/30 shadow-[0_8px_24px_rgba(74,222,128,0.2)] backdrop-blur-md absolute -top-4 -right-6 z-20 animate-float-bob-delayed-1">
            <Icon name="ShieldCheckIcon" size={16} className="text-[#4ADE80]" />
            <span className="text-xs font-mono font-medium text-[#4ADE80]">
              CIN Registry Verified
            </span>
          </div>

          {/* Floating Tag 3: Bottom Left - Bobbing */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161922]/90 border border-[#818CF8]/30 shadow-[0_8px_24px_rgba(129,140,248,0.2)] backdrop-blur-md absolute -bottom-5 -left-6 z-20 animate-float-bob-delayed-2">
            <Icon name="CpuChipIcon" size={16} className="text-[#818CF8]" />
            <span className="text-xs font-mono font-medium text-[#818CF8]">
              AI Forensics Active · 142ms
            </span>
          </div>

          {/* The Main Mockup Window */}
          <div className="rounded-2xl bg-[#161922] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 hover:border-white/[0.14]">
            {/* Chrome Bar */}
            <div className="bg-[#10121A] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]/80" />
                <div className="w-3 h-3 rounded-full bg-[#FBBF24]/80" />
                <div className="w-3 h-3 rounded-full bg-[#4ADE80]/80" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-[#161922] border border-white/[0.06] text-xs font-mono text-muted-foreground/80">
                <Icon name="LockClosedIcon" size={12} className="text-[#4ADE80]" />
                <span>trustscan.ai/forensics/live-inspect</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground/50">
                <span className="text-[10px] font-mono uppercase bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                  v4.4 Live
                </span>
              </div>
            </div>

            {/* Mockup Body: Split 2 Panels */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-b from-[#161922] to-[#12141C]">
              {/* Left Panel: Uploaded File & Metadata */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Input Artifact
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/20">
                    Payment Receipt
                  </span>
                </div>

                {/* File Thumbnail & Meta Box */}
                <div className="p-4 rounded-xl bg-[#0A0B0F]/60 border border-white/[0.06] space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FF6B4A]/15 border border-[#FF6B4A]/30 flex items-center justify-center text-[#FF6B4A]">
                      <Icon name="DocumentIcon" size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-semibold font-mono text-white truncate">
                        upi_receipt_4500.jpg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Image / JPEG • 1.2 MB
                      </div>
                    </div>
                  </div>

                  {/* Metadata Rows */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Document Type</span>
                      <span className="text-white font-medium">UPI Payment Screenshot</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Extracted UTR</span>
                      <span className="text-red-400 font-semibold">429188291034 (Mismatch)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Stated Amount</span>
                      <span className="text-white font-bold">₹4,500.00</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Engine Latency</span>
                      <span className="text-[#4ADE80]">142 ms (Realtime)</span>
                    </div>
                  </div>
                </div>

                {/* Spectral ELA Preview Strip */}
                <div className="p-3 rounded-xl bg-[#0A0B0F]/40 border border-white/[0.04] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-ping" />
                    <span className="text-muted-foreground font-mono">ELA Tamper Map:</span>
                  </div>
                  <span className="font-mono text-red-400 font-semibold">
                    Amount Font Altered (+8.4σ)
                  </span>
                </div>
              </div>

              {/* Right Panel: AI Forensic Analysis */}
              <div className="space-y-4 md:border-l md:border-white/[0.06] md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Forensic Verdict
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    High Risk / Forgery
                  </div>
                </div>

                {/* Animated Risk Score Bar */}
                <div className="p-4 rounded-xl bg-[#0A0B0F]/60 border border-white/[0.06] space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-muted-foreground">
                      Calculated Risk Score
                    </span>
                    <div className="text-lg font-headline font-bold text-red-400">
                      72 <span className="text-xs font-mono text-muted-foreground">/ 100</span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="w-full h-2.5 rounded-full bg-[#1C202B] overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FBBF24] via-[#FF6B4A] to-[#EF4444] animate-risk-bar"
                      style={{ width: '72%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground/70">
                    <span>Safe (0-30)</span>
                    <span>Review (31-60)</span>
                    <span className="text-red-400 font-semibold">Critical (61-100)</span>
                  </div>
                </div>

                {/* Red / Green Flags Checklist */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-xs font-mono p-2 rounded-lg bg-red-500/[0.06] border border-red-500/15 text-red-300">
                    <Icon name="ExclamationTriangleIcon" size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span>Pixel-level ELA compression anomaly on amount text string</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs font-mono p-2 rounded-lg bg-red-500/[0.06] border border-red-500/15 text-red-300">
                    <Icon name="XCircleIcon" size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <span>12-digit UTR failed NPCI issuer timestamp sequence verification</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs font-mono p-2 rounded-lg bg-[#4ADE80]/[0.06] border border-[#4ADE80]/15 text-[#86EFAC]">
                    <Icon name="CheckCircleIcon" size={16} className="text-[#4ADE80] flex-shrink-0 mt-0.5" />
                    <span>Bank IFSC structure resolves to active RBI clearing code</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;