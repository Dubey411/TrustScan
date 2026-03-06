import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface VerdictBadgeProps {
  verdict: 'safe' | 'risky' | 'scam' | 'fraud' | 'suspicious' | 'action_required' | 'greylisted' | 'blacklisted';
  score: number;
  type?: string;
  customLabel?: string;
}

const VerdictBadge = ({ verdict, score, type, customLabel }: VerdictBadgeProps) => {
  const isDocument = type === 'document';
  const isLink = type === 'link';

  const verdictConfig = {
    safe: {
      gradient: 'from-[#059669] via-[#10b981] to-[#34d399]',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
      textColor: 'text-white',
      icon: 'ShieldCheckIcon',
      label: isDocument ? 'Verified Authentic' : (isLink ? 'SAFE TO OPEN' : 'Safe'),
      description: 'The content matches verified institutional patterns and has no malicious signals.',
    },
    risky: {
      gradient: 'from-[#d97706] via-[#f59e0b] to-[#fbbf24]',
      glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
      textColor: 'text-white',
      icon: 'ExclamationTriangleIcon',
      label: 'Potential Risk Detected',
      description: 'Some elements look unusual. Verify manually before sharing personal data.',
    },
    suspicious: {
      gradient: 'from-[#ea580c] via-[#f97316] to-[#fb923c]',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
      textColor: 'text-white',
      icon: 'MagnifyingGlassIcon',
      label: 'Suspicious Content',
      description: 'Multiple high-risk behavioral patterns detected. Proceed with extreme caution.',
    },
    action_required: {
      gradient: 'from-[#475569] via-[#64748b] to-[#94a3b8]',
      glow: 'shadow-[0_0_30px_rgba(100,116,139,0.2)]',
      textColor: 'text-white',
      icon: 'ClockIcon',
      label: 'Further Details Needed',
      description: 'Missing business identifiers or clear intent. Verification is incomplete.',
    },
    scam: {
      gradient: 'from-[#dc2626] via-[#ef4444] to-[#f87171]',
      glow: 'shadow-[0_0_40px_rgba(239,68,68,0.4)]',
      textColor: 'text-white',
      icon: 'NoSymbolIcon',
      label: 'SCAM DETECTED',
      description: 'Confirmed patterns of phishing or predatory recruitment identified.',
    },
    fraud: {
      gradient: 'from-[#991b1b] via-[#dc2626] to-[#ef4444]',
      glow: 'shadow-[0_0_40px_rgba(220,38,38,0.5)]',
      textColor: 'text-white',
      icon: 'ShieldExclamationIcon',
      label: 'CRITICAL FRAUD ALERT',
      description: 'High probability of identity theft or financial loss. DO NOT INTERACT.',
    },
    greylisted: {
        gradient: 'from-[#f59e0b] via-[#fbbf24] to-[#fcd34d]',
        glow: 'shadow-[0_0_40px_rgba(245,158,11,0.4)]',
        textColor: 'text-amber-950',
        icon: 'ExclamationTriangleIcon',
        label: 'DATABASE GREYLIST HIT',
        description: 'This entity is registered but has active reports of predatory behavior or training fees.',
    },
    blacklisted: {
        gradient: 'from-[#7f1d1d] via-[#991b1b] to-[#b91c1c]',
        glow: 'shadow-[0_0_40px_rgba(153,27,27,0.5)]',
        textColor: 'text-white',
        icon: 'NoSymbolIcon',
        label: 'DATABASE BLACKLIST HIT',
        description: 'This entity is a confirmed fraud source in our Global Intelligence Database.',
    },
  };

  const normalizedVerdict = (verdict?.toLowerCase() || 'risky') as keyof typeof verdictConfig;
  const config = verdictConfig[normalizedVerdict] || verdictConfig['risky'];
  const displayLabel = customLabel || config.label;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${config.gradient} ${config.textColor} rounded-[2rem] p-8 ${config.glow} transition-all duration-500 animate-in fade-in zoom-in-95 duration-700`}>
      {/* Decorative background flare */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full blur-2xl" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 animate-bounce-subtle border border-white/30 shadow-inner">
            <Icon name={config.icon as any} size={40} variant="solid" className="drop-shadow-lg" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-[10px] uppercase font-black tracking-widest bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                   TrustScan AI Verdict
                </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-black mb-1 drop-shadow-sm tracking-tight">
               {displayLabel}
            </h2>
            <p className="text-sm md:text-base opacity-90 font-medium max-w-md leading-relaxed">
               {config.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end text-center md:text-right border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-10 w-full md:w-auto">
          <div className="relative group">
            <div className={`absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="text-6xl md:text-7xl font-headline font-black mb-1 tracking-tighter tabular-nums drop-shadow-md relative">
               {Math.round(score)}%
            </div>
          </div>
          <div className="text-[10px] md:text-xs uppercase font-black tracking-[0.2em] opacity-80 mt-1">
             Fraud Risk Index
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerdictBadge;