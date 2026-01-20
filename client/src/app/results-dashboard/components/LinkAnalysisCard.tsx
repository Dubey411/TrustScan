'use client';
// Force build update


import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface DetectedLink {
  url: string;
  host: string;
  flags: string[];
  redirectChain?: string[];
  finalDestination?: string;
}

interface LinkAnalysisCardProps {
  detectedLinks: DetectedLink[];
}

const FLAG_MAP: Record<string, { label: string; description: string; color: string; icon: any }> = {
  SHORTENER: {
    label: 'URL Shortener',
    description: 'Masks the final destination to hide malicious intent.',
    color: 'amber',
    icon: 'EyeSlashIcon'
  },
  TYPOSQUATTING: {
    label: 'Domain Deception',
    description: 'Mimics a trusted brand (e.g., "amaz0n") to steal credentials.',
    color: 'red',
    icon: 'ExclamationTriangleIcon'
  },
  SUSPICIOUS_TLD: {
    label: 'High-Risk TLD',
    description: 'Uses a domain extension (.top, .icu) linked to bulk phishing.',
    color: 'amber',
    icon: 'ShieldExclamationIcon'
  },
  IP_HOST: {
    label: 'Direct IP Address',
    description: 'Bypasses domain registration for total anonymity; highly risky.',
    color: 'red',
    icon: 'ServerIcon'
  }
};

const LinkAnalysisCard = ({ detectedLinks }: LinkAnalysisCardProps) => {
  if (!detectedLinks || detectedLinks.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Icon name="LinkIcon" size={18} />
          Detailed Link Analysis
        </h3>
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
          {detectedLinks.length} Links Found
        </span>
      </div>
      <div className="divide-y divide-border">
        {detectedLinks.map((link, idx) => (
          <div key={idx} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Host Verified</p>
                <code className="text-sm text-foreground bg-muted px-2 py-1 rounded inline-block truncate max-w-full">
                  {link.host}
                </code>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Status</p>
                {link.flags.length > 0 ? (
                  <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                    <Icon name="NoSymbolIcon" size={14} /> Suspicious
                  </span>
                ) : (
                  <span className="text-success text-xs font-bold flex items-center gap-1">
                    <Icon name="CheckCircleIcon" size={14} /> Clear
                  </span>
                )}
              </div>
            </div>

            {link.flags.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {link.flags.map((flag, fIdx) => {
                  const info = FLAG_MAP[flag];
                  if (!info) return null;
                  return (
                    <div 
                      key={fIdx} 
                      className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                        info.color === 'red' 
                          ? 'bg-red-50/50 border-red-100' 
                          : 'bg-amber-50/50 border-amber-100'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        info.color === 'red' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        <Icon name={info.icon} size={18} variant="solid" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold uppercase ${
                          info.color === 'red' ? 'text-red-700' : 'text-amber-700'
                        }`}>
                          {info.label}
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-muted/30 p-3 rounded-lg space-y-2">
              <div className="text-[10px] text-muted-foreground break-all">
                <span className="font-bold uppercase mr-2 text-xs">Original Link:</span>
                {link.url}
              </div>

              {(() => {
                const chain = link.redirectChain;
                if (!chain || chain.length === 0) return null;
                
                return (
                  <div className="mt-2 space-y-2 border-t border-border pt-2">
                    <div className="text-xs font-bold text-sky-600 flex items-center gap-1">
                      <Icon name="ArrowPathIcon" size={14} />
                      Deep Diver Trace:
                    </div>
                    <div className="space-y-1">
                      {chain.map((hop, hIdx) => (
                        <div key={hIdx} className="flex items-center gap-2 text-[10px] text-muted-foreground ml-2">
                          <span className="text-muted-foreground/50">↳</span>
                          <span className={`px-1.5 py-0.5 rounded ${hIdx === chain.length - 1 ? 'bg-red-100 text-red-700 font-bold border border-red-200' : 'bg-background border border-border'}`}>
                             {hIdx === chain.length - 1 ? `🎯 Final: ${hop}` : hop}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-3 bg-muted/20 text-[10px] text-muted-foreground italic flex items-center gap-2">
        <Icon name="InformationCircleIcon" size={14} />
        Transparency Report: Our engine analyzes domain reputation, TLD history, and character similarity to identify obfuscation.
      </div>
    </div>
  );
};

export default LinkAnalysisCard;
