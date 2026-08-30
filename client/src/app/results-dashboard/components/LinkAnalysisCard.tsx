'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * LinkAnalysisCard Component
 * 
 * Inspects URLs and embedded links for phishing and spoofing:
 * - Unshortens redirect chains (Bitly, TinyURL, WhatsApp redirects)
 * - Domain similarity and lookalike typo-squatting detection
 * - Live HTTP status code and header inspection
 */
interface DetectedLink {
  url: string;
  host: string;
  flags: string[];
  redirectChain?: string[];
  finalDestination?: string;
  liveMetadata?: {
    title: string;
    description: string;
    status: number;
  };
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
  },
  HOMOGRAPH_ATTACK: {
    label: 'Homograph Attack',
    description: 'Uses special characters (Punycode) to look like a legitimate brand.',
    color: 'red',
    icon: 'MasksIcon'
  },
  EXCESSIVE_SUBDOMAINS: {
    label: 'Subdomain Abuse',
    description: 'Deep nested subdomains (a.b.c.com) are often used to hide the true host.',
    color: 'amber',
    icon: 'QueueListIcon'
  },
  CREDENTIAL_OR_PATH_OBFUSCATION: {
    label: 'Path Obfuscation',
    description: 'Uses "@" or credentials in URL to misdirect your browser.',
    color: 'red',
    icon: 'NoSymbolIcon'
  },
  DANGEROUS_REDIRECT_TARGET: {
    label: 'Dangerous Target',
    description: 'The final destination after redirects is a known malicious TLD.',
    color: 'red',
    icon: 'FireIcon'
  },
  BRAND_CONTENT_MISMATCH: {
    label: 'Brand Mismatch',
    description: 'The page content claims to be a trusted brand (e.g., "Facebook"), but the domain name does not match. This is a common phishing signal.',
    color: 'red',
    icon: 'UserIcon'
  },
  KNOWN_SCAM_DATABASE: {
    label: 'Blacklisted',
    description: 'This link has been reported as a confirmed scam by the security community.',
    color: 'red',
    icon: 'NoSymbolIcon'
  }
};

const LinkAnalysisCard = ({ detectedLinks }: LinkAnalysisCardProps) => {
  if (!detectedLinks || detectedLinks.length === 0) return null;

  // Extra safety: Deduplicate by normalized host for frontend display
  const seenHosts = new Set();
  const uniqueLinks = detectedLinks.filter(link => {
      const h = (link.host || new URL(link.url.startsWith('http') ? link.url : 'http://' + link.url).hostname).toLowerCase().replace(/^www\./, '');
      if (seenHosts.has(h)) return false;
      seenHosts.add(h);
      return true;
  });

  if (uniqueLinks.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Icon name="LinkIcon" size={18} />
          Detailed Link Analysis
        </h3>
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
          {uniqueLinks.length} Links Found
        </span>
      </div>
      <div className="divide-y divide-border">
        {uniqueLinks.map((link, idx) => (
          <div key={idx} className="p-6 space-y-4 hover:bg-muted/10 transition-colors">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 min-w-0 w-full">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Host Verified</p>
                <div className="flex items-center gap-2 overflow-hidden">
                    <code className="text-sm font-bold text-foreground bg-muted/50 px-3 py-1.5 rounded-lg truncate max-w-full">
                    {link.host}
                    </code>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 sm:flex-col sm:items-end">
                <p className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Security Status</p>
                {link.flags.length > 0 ? (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-red-500/20">
                    <Icon name="NoSymbolIcon" size={14} /> Suspicious
                  </span>
                ) : (
                  <span className="bg-success/10 text-success text-[10px] font-bold px-3 py-1.5 rounded-full uppercase flex items-center gap-1.5 border border-success/20">
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

            <div className="bg-muted/30 p-4 rounded-xl space-y-3">
              <div className="text-[10px] text-muted-foreground break-all">
                <span className="font-bold uppercase mr-2 text-xs">Original Link:</span>
                <span className="text-foreground/80">{link.url}</span>
              </div>

              {link.liveMetadata && (
                <div className="bg-background/50 p-4 rounded-lg border border-border/50 space-y-3">
                   <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 border-b border-border/50 pb-2">
                     <Icon name="GlobeAltIcon" size={14} className="text-primary" />
                     Live Site Intelligence
                   </div>
                   
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-foreground">
                        {link.liveMetadata.title || "No Title Found"}
                      </p>
                      {link.liveMetadata.description && (
                         <p className="text-[10px] text-muted-foreground line-clamp-2 italic leading-relaxed">
                            "{link.liveMetadata.description}"
                         </p>
                      )}
                   </div>

                   {/* Curiosity Tags & Technical Footprints */}
                   {(link.liveMetadata as any).curiosityTags && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {/* Platform Badge */}
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md border border-border/50">
                           <Icon name="WrenchScrewdriverIcon" size={12} className="text-muted-foreground" />
                           <span className="text-[9px] font-bold text-foreground uppercase tracking-tight">
                              Built with: {(link.liveMetadata as any).curiosityTags.platform}
                           </span>
                        </div>

                        {/* Security Feature Badge */}
                        {(link.liveMetadata as any).curiosityTags.hasLoginForm && (
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/5 rounded-md border border-amber-500/10">
                              <Icon name="LockClosedIcon" size={12} className="text-amber-600" />
                              <span className="text-[9px] font-bold text-amber-700 uppercase tracking-tight">
                                 Contains Login Form
                              </span>
                           </div>
                        )}

                        {/* Contact Footprints */}
                        {(link.liveMetadata as any).curiosityTags.contactFootprint?.length > 0 && (
                           <div className="w-full flex flex-wrap gap-2 mt-1">
                              {(link.liveMetadata as any).curiosityTags.contactFootprint.map((info: string, iIndex: number) => (
                                 <div key={iIndex} className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 rounded-md border border-primary/10">
                                    <Icon name="IdentificationIcon" size={12} className="text-primary" />
                                    <span className="text-[9px] font-medium text-primary-foreground/70">
                                       Found: {info}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        )}
                      </div>
                   )}
                </div>
              )}

              {(() => {
                const chain = link.redirectChain;
                if (!chain || chain.length === 0) return null;
                
                return (
                  <div className="mt-3 space-y-3 border-t border-border pt-3">
                    <div className="text-[10px] font-bold text-sky-600 flex items-center gap-2 uppercase tracking-widest">
                      <Icon name="ArrowPathIcon" size={14} />
                      Deep Diver Trace:
                    </div>
                    <div className="flex flex-col gap-2">
                       {chain.map((hop, hIdx) => (
                        <div
                            key={hIdx}
                            className="flex items-start gap-3 text-[10px] text-muted-foreground"
                        >
                            <span className="text-muted-foreground/30 mt-1">↳</span>
                            <span
                            className={`px-3 py-1.5 rounded-lg break-all ${
                                hIdx === chain.length - 1
                                ? 'bg-red-500/10 text-red-600 font-bold border border-red-500/20'
                                : 'bg-background border border-border shadow-sm'
                            }`}
                            >
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
