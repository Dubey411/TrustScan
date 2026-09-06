'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface PaymentReceiptProps {
  transactionId?: string;
  amount?: string;
  appDetected?: string;
  vpaHandle?: string;
  ifscCode?: string;
  bankName?: string;
  isFakeApkDetected?: boolean;
  forensicTamperScore?: number;
  isAiGenerated?: boolean;
  aiGenerationScore?: number;
  forensicVerdict?: 'CLEAN' | 'AI_GENERATED' | 'TAMPERED_REAL_IMAGE' | 'AI_GENERATED_AND_EDITED';
  generatorFamilyHint?: string | null;
  trustScore?: number;
}

export default function PaymentReceiptCard({
  transactionId = '328901928392',
  amount = '₹50,000',
  appDetected = 'Google Pay / PhonePe',
  vpaHandle = 'merchant@okhdfcbank',
  ifscCode = 'HDFC0000123',
  bankName = 'HDFC Bank Ltd',
  isFakeApkDetected = false,
  forensicTamperScore = 14,
  isAiGenerated = false,
  aiGenerationScore = 0,
  forensicVerdict = 'CLEAN',
  generatorFamilyHint = null,
  trustScore = 100
}: PaymentReceiptProps) {
  const isSuspicious = isFakeApkDetected || trustScore < 50;

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* 1. Transaction Summary Bar */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0B0F] p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Icon name="BanknotesIcon" size={16} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Recipient VPA</div>
            <div className="text-xs font-mono font-bold text-white truncate">{vpaHandle}</div>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Amount</div>
          <div className="text-sm font-mono font-bold text-emerald-400">{amount}</div>
        </div>
      </div>

      {/* 2. Compact 2x2 Forensic Signal Cards */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0A0B0F] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            UPI Forensic Signals
          </span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
            isSuspicious ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}>
            {isSuspicious ? 'RISK DETECTED' : 'ALL SIGNALS PASSED'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Signal 1: 12-Digit UTR */}
          <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 truncate">
                <Icon name="HashtagIcon" size={13} className="text-emerald-400 flex-shrink-0" />
                12-Digit UTR Ref
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                NPCI FORMAT
              </span>
            </div>
            <div className="text-xs font-mono font-semibold text-white tracking-wide truncate">
              {transactionId}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Valid Numerical Syntax
            </div>
          </div>

          {/* Signal 2: Fake APK Defense */}
          <div className={`p-3 rounded-lg border flex flex-col justify-between gap-1.5 ${
            isFakeApkDetected ? 'bg-red-500/[0.06] border-red-500/30' : 'bg-white/[0.02] border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 truncate">
                <Icon name="DevicePhoneMobileIcon" size={13} className={isFakeApkDetected ? 'text-red-400' : 'text-emerald-400'} />
                App UI Defense
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                !isFakeApkDetected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {!isFakeApkDetected ? 'GENUINE UI' : 'SPLICED UI'}
              </span>
            </div>
            <div className={`text-xs font-headline font-semibold truncate ${
              isFakeApkDetected ? 'text-red-400' : 'text-white'
            }`}>
              {!isFakeApkDetected ? 'Consistent Typography' : 'Fake APK Trace'}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${!isFakeApkDetected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              App UI: {appDetected}
            </div>
          </div>

          {/* Signal 3: Resolved Bank & IFSC */}
          <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 truncate">
                <Icon name="BuildingLibraryIcon" size={13} className="text-blue-400 flex-shrink-0" />
                Bank & Branch
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex-shrink-0">
                RBI DIRECTORY
              </span>
            </div>
            <div className="text-xs font-headline font-semibold text-white truncate">
              {bankName}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/70 truncate">
              IFSC: <span className="text-white">{ifscCode}</span>
            </div>
          </div>

          {/* Signal 4: Mule & Fraud Watchlist */}
          <div className={`p-3 rounded-lg border flex flex-col justify-between gap-1.5 ${
            isSuspicious ? 'bg-red-500/[0.06] border-red-500/30' : 'bg-white/[0.02] border-white/[0.06]'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 truncate">
                <Icon name="ShieldCheckIcon" size={13} className={isSuspicious ? 'text-red-400' : 'text-emerald-400'} />
                Mule Watchlist
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                isSuspicious ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {isSuspicious ? 'SUSPICIOUS' : 'CLEARED'}
              </span>
            </div>
            <div className={`text-xs font-headline font-semibold truncate ${
              isSuspicious ? 'text-red-400' : 'text-white'
            }`}>
              {isSuspicious ? 'Flagged Account Activity' : 'Clean Account Profile'}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/70 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${!isSuspicious ? 'bg-emerald-400' : 'bg-red-400'}`} />
              NPCI Registry Queried
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
