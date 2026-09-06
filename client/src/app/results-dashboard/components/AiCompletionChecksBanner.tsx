'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface AiCompletionChecksBannerProps {
  scanData: any;
  onShare?: () => void;
  onDownload?: () => void;
}

export default function AiCompletionChecksBanner({ scanData, onShare, onDownload }: AiCompletionChecksBannerProps) {
  const [copied, setCopied] = useState(false);
  const scanType = scanData?.scanType || scanData?.type || 'document';
  const riskScore = scanData?.riskScore !== undefined ? scanData.riskScore : (scanData?.confidence || 72);
  const isSafe = scanData?.result === 'safe' || riskScore < 35;
  const isSuspicious = riskScore >= 35 && riskScore < 65;
  const isCritical = riskScore >= 65;

  const imageForensics = scanData?.metadata?.imageForensics || {};
  const isAiGenerated = Boolean(imageForensics.isAiGenerated) || scanData?.scanMeta?.forensicAiScore >= 50;
  const isTampered = Boolean(imageForensics.isTampered) || scanData?.scanMeta?.forensicTamperScore >= 40 || scanData?.reasons?.some((r: string) => r.toLowerCase().includes('tamper') || r.toLowerCase().includes('ela') || r.toLowerCase().includes('altered'));

  const scanId = String(scanData?.id || scanData?._id || `SCN-${Date.now().toString().slice(-6)}`);

  const handleCopyId = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(scanId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rounded-3xl border-2 p-6 sm:p-8 mb-8 shadow-xl transition-all duration-300 relative overflow-hidden ${
      isCritical
        ? 'bg-card dark:bg-gradient-to-br dark:from-[#161922] dark:via-[#1F171A] dark:to-[#161922] border-red-500/30 shadow-red-500/5'
        : isSuspicious
        ? 'bg-card dark:bg-gradient-to-br dark:from-[#161922] dark:via-[#1F1C17] dark:to-[#161922] border-amber-500/30 shadow-amber-500/5'
        : 'bg-card dark:bg-gradient-to-br dark:from-[#161922] dark:via-[#161D1A] dark:to-[#161922] border-emerald-500/30 shadow-emerald-500/5'
    }`}>
      {/* Top Background Glow Halo */}
      <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none ${
        isCritical ? 'bg-red-500' : isSuspicious ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Overall Verdict & AI Status */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-muted dark:bg-white/[0.05] border border-border text-foreground">
              AI Verification Complete
            </span>
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
              Audit ID: {scanId}
              <button
                onClick={handleCopyId}
                className="hover:text-primary transition-colors ml-1 p-0.5"
                title="Copy Audit ID"
              >
                <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14} className={copied ? 'text-emerald-400' : ''} />
              </button>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              isCritical
                ? 'bg-red-500/20 border border-red-500/40 text-red-400'
                : isSuspicious
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
            }`}>
              <Icon
                name={isCritical ? 'ExclamationTriangleIcon' : isSuspicious ? 'ExclamationCircleIcon' : 'ShieldCheckIcon'}
                size={28}
                variant="solid"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
                {isCritical ? 'Critical Threat / Forgery Detected' : isSuspicious ? 'Suspicious Signal Anomaly' : 'Real & Verified Authentic'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground font-body">
                {isCritical
                  ? 'Multi-stage deterministic invariant analysis flagged high probability of digital tampering or fraudulent credentials.'
                  : isSuspicious
                  ? 'Inconclusive signals or minor discrepancies identified. Manual scrutiny advised.'
                  : 'Document passed cryptographic checks, optical spectral frequency tests, and active registry validation.'}
              </p>
            </div>
          </div>

          {/* AI Completion Checks Badges Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* AI Generated Check */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
              isAiGenerated
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}>
              <Icon name={isAiGenerated ? 'SparklesIcon' : 'CheckCircleIcon'} size={14} />
              <span>AI Origin: {isAiGenerated ? 'AI-Generated / Altered' : 'Real & Genuine Artifact'}</span>
            </div>

            {/* ELA Tampering Check */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
              isTampered
                ? 'bg-red-500/15 border-red-500/30 text-red-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}>
              <Icon name={isTampered ? 'ScissorsIcon' : 'CheckCircleIcon'} size={14} />
              <span>Pixel Integrity: {isTampered ? 'Tampered / Modified' : 'Clean & Unaltered'}</span>
            </div>

            {/* Registry / Invariant Check */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold ${
              isCritical
                ? 'bg-red-500/15 border-red-500/30 text-red-300'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            }`}>
              <Icon name={isCritical ? 'XCircleIcon' : 'ShieldCheckIcon'} size={14} />
              <span>Entity Validation: {isCritical ? 'Failed Rules' : 'MCA / NPCI Conforming'}</span>
            </div>
          </div>
        </div>

        {/* Right: Calculated Risk Score & Rating Dial */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 p-5 rounded-2xl bg-muted dark:bg-[#0A0B0F]/70 border border-border min-w-[240px]">
          <div className="w-full">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Calculated Risk Score
              </span>
              <span className={`text-2xl font-headline font-bold ${
                isCritical ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {riskScore} <span className="text-xs font-mono text-muted-foreground">/ 100</span>
              </span>
            </div>

            {/* Progress Rating Bar */}
            <div className="w-full h-2 rounded-full bg-muted dark:bg-white/[0.08] overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isCritical
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500'
                    : isSuspicious
                    ? 'bg-gradient-to-r from-blue-500 to-amber-500'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, riskScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground/80 mt-1">
              <span>Low (0-34)</span>
              <span>Medium (35-64)</span>
              <span>Critical (65-100)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border w-full justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">Rating Status:</span>
            <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isCritical ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {isCritical ? 'High Risk' : isSuspicious ? 'Review Required' : 'Safe / Authentic'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
