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
  trustScore = 100
}: PaymentReceiptProps) {
  return (
    <div className="bg-card rounded-3xl border-2 border-emerald-500/20 shadow-2xl overflow-hidden mb-8 transition-all duration-300 hover:border-emerald-500/40">
      {/* 🌟 Bespoke Payment & UPI Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 p-6 md:p-8 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-400 shadow-inner">
            <Icon name="CreditCardIcon" size={36} variant="solid" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                NPCI Banking & UPI Audit
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Real-Time Settlement Spec
              </span>
            </div>
            <h2 className="font-headline font-black text-2xl md:text-3xl text-foreground">
              💳 UPI Payment & Banking Transaction Audit
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              12-digit UTR reference validation, fake APK font integrity & banking IFSC resolver
            </p>
          </div>
        </div>

        {/* Big Verdict Dial */}
        <div className="flex items-center gap-4 bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-sm">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Transaction Legitimacy</div>
            <div className={`text-3xl font-black ${trustScore >= 80 ? 'text-success' : trustScore >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {trustScore} / 100
            </div>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${trustScore >= 80 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
            <Icon name={trustScore >= 80 ? 'CheckBadgeIcon' : 'ExclamationTriangleIcon'} size={28} variant="solid" />
          </div>
        </div>
      </div>

      {/* 📊 Core Inspection Grid */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: 12-Digit UTR Ref */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="HashtagIcon" size={16} className="text-emerald-400" />
                  12-Digit UTR Ref
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-success/10 text-success border border-success/20">
                  NPCI FORMAT
                </span>
              </div>
              <div className="text-xl font-mono font-black text-foreground tracking-wider">
                {transactionId}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Matches official NPCI transaction reference numbering structure.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Icon name="CheckCircleIcon" size={14} />
              Valid 12-Digit Numerical Syntax
            </div>
          </div>

          {/* Card 2: Fake APK Font Splicing Check */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="ShieldExclamationIcon" size={16} className="text-amber-400" />
                  Fake APK Font Defense
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${!isFakeApkDetected ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {!isFakeApkDetected ? 'GENUINE UI' : 'SPLICED UI'}
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {!isFakeApkDetected ? 'Consistent Typography & Baseline' : 'Fake Payment Generator Trace'}
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                {!isFakeApkDetected 
                  ? `Rendered using original ${appDetected} UI styles without font weight or kerning anomalies.` 
                  : 'Amount font size does not match application template standard. Likely generated via fake APK.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Icon name="DevicePhoneMobileIcon" size={14} />
              App Interface: {appDetected}
            </div>
          </div>

          {/* Card 3: Resolved Bank & IFSC */}
          <div className="bg-muted/30 hover:bg-muted/40 transition-colors rounded-2xl p-5 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Icon name="BuildingLibraryIcon" size={16} className="text-blue-400" />
                  Bank & Branch Resolver
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  RBI DIRECTORY
                </span>
              </div>
              <div className="text-base font-bold text-foreground">
                {bankName}
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-2 leading-relaxed">
                IFSC: <span className="font-bold text-foreground">{ifscCode}</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-border/50 text-[11px] font-mono text-blue-400 flex items-center gap-1">
              <Icon name="ShieldCheckIcon" size={14} />
              Verified Banking Institution
            </div>
          </div>
        </div>

        {/* 💳 Payment Details Summary Bar */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-background to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Icon name="BanknotesIcon" size={22} variant="solid" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground flex items-center gap-2">
                Audited Transaction Amount & Recipient VPA
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Recipient Handle: <span className="font-mono text-foreground font-semibold">{vpaHandle}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card px-5 py-2.5 rounded-xl border border-border">
            <span className="text-xs text-muted-foreground">Amount:</span>
            <span className="font-black text-lg text-emerald-400 tracking-wide">{amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
