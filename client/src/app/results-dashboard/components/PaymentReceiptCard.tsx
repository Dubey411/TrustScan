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
}

export default function PaymentReceiptCard({
  transactionId = '328901928392',
  amount = '₹50,000',
  appDetected = 'Google Pay / PhonePe',
  vpaHandle = 'merchant@okhdfcbank',
  ifscCode = 'HDFC0000123',
  bankName = 'HDFC Bank Ltd',
  isFakeApkDetected = false
}: PaymentReceiptProps) {
  return (
    <div className="bg-card rounded-2xl border-2 border-emerald-500/20 shadow-brand overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-5 border-b border-emerald-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Icon name="CreditCardIcon" size={24} variant="solid" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-foreground">
              💳 Payment & UPI Transaction Audit
            </h3>
            <p className="text-xs text-muted-foreground">
              National Payments Corporation of India (NPCI) & Banking UTR verification
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">
          UTR Audited
        </span>
      </div>

      {/* Grid Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 12-Digit UTR Ref */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="HashtagIcon" size={18} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                12-Digit UPI Ref / UTR
              </span>
            </div>
            <div className="text-sm font-mono font-bold text-foreground">
              {transactionId}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 text-success">
              <Icon name="CheckCircleIcon" size={14} variant="solid" />
              Valid NPCI Syntax Format
            </p>
          </div>

          {/* Card 2: Fake App / Font Splicing Defense */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="ShieldExclamationIcon" size={18} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Fake APK Spoof Check
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {isFakeApkDetected ? (
                <span className="text-destructive font-bold">⚠️ Spliced Font Inconsistency</span>
              ) : (
                <span className="text-success flex items-center gap-1.5">
                  <Icon name="CheckCircleIcon" size={16} variant="solid" />
                  Original UI Layout Confirmed
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              App: {appDetected}
            </p>
          </div>

          {/* Card 3: Bank & Branch Resolver */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="BuildingLibraryIcon" size={18} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Resolved Bank & IFSC
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {bankName}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              IFSC: {ifscCode}
            </p>
          </div>
        </div>

        {/* Transaction Summary Bar */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="BanknotesIcon" size={20} className="text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-foreground">Payment Amount & Handle</p>
              <p className="text-[11px] text-muted-foreground">
                Recipient VPA: <span className="font-mono text-foreground font-semibold">{vpaHandle}</span>
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-background px-3 py-1 rounded border border-border">
            {amount}
          </span>
        </div>
      </div>
    </div>
  );
}
