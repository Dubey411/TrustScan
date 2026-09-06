import React from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * VerdictBadge Component — Restyled for TrustScan AI dark premium theme.
 * Compact card with left-border accent, verdict pill, and trust score ring.
 */
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
      border: 'border-l-[#4ADE80]',
      glow: 'shadow-[0_0_20px_rgba(74,222,128,0.12)]',
      ring: '#4ADE80',
      ringGlow: 'rgba(74,222,128,0.4)',
      bg: 'bg-[#4ADE80]/8',
      pill: 'bg-[#4ADE80]/15 border-[#4ADE80]/40 text-[#4ADE80]',
      icon: 'ShieldCheckIcon',
      iconColor: 'text-[#4ADE80]',
      label: isDocument ? 'Verified Authentic' : (isLink ? 'Safe to Open' : 'Verified Safe'),
      sub: 'No fraud signals detected. Document matches institutional patterns.',
    },
    risky: {
      border: 'border-l-[#FBBF24]',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.1)]',
      ring: '#FBBF24',
      ringGlow: 'rgba(251,191,36,0.4)',
      bg: 'bg-[#FBBF24]/8',
      pill: 'bg-[#FBBF24]/15 border-[#FBBF24]/40 text-[#FBBF24]',
      icon: 'ExclamationTriangleIcon',
      iconColor: 'text-[#FBBF24]',
      label: 'Potential Risk Detected',
      sub: 'Unusual elements found. Verify manually before sharing personal data.',
    },
    suspicious: {
      border: 'border-l-[#FF6B4A]',
      glow: 'shadow-[0_0_20px_rgba(255,107,74,0.12)]',
      ring: '#FF6B4A',
      ringGlow: 'rgba(255,107,74,0.4)',
      bg: 'bg-[#FF6B4A]/8',
      pill: 'bg-[#FF6B4A]/15 border-[#FF6B4A]/40 text-[#FF6B4A]',
      icon: 'MagnifyingGlassIcon',
      iconColor: 'text-[#FF6B4A]',
      label: 'Suspicious Signal Anomaly',
      sub: 'Multiple high-risk behavioral patterns detected. Proceed with extreme caution.',
    },
    action_required: {
      border: 'border-l-[#818CF8]',
      glow: 'shadow-[0_0_20px_rgba(129,140,248,0.1)]',
      ring: '#818CF8',
      ringGlow: 'rgba(129,140,248,0.35)',
      bg: 'bg-[#818CF8]/8',
      pill: 'bg-[#818CF8]/15 border-[#818CF8]/40 text-[#818CF8]',
      icon: 'ClockIcon',
      iconColor: 'text-[#818CF8]',
      label: 'Further Details Needed',
      sub: 'Missing business identifiers. Verification is incomplete.',
    },
    scam: {
      border: 'border-l-red-500',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      ring: '#EF4444',
      ringGlow: 'rgba(239,68,68,0.45)',
      bg: 'bg-red-500/8',
      pill: 'bg-red-500/15 border-red-500/40 text-red-400',
      icon: 'NoSymbolIcon',
      iconColor: 'text-red-400',
      label: 'Scam Detected',
      sub: 'Confirmed phishing or predatory recruitment patterns identified.',
    },
    fraud: {
      border: 'border-l-red-600',
      glow: 'shadow-[0_0_24px_rgba(220,38,38,0.2)]',
      ring: '#DC2626',
      ringGlow: 'rgba(220,38,38,0.5)',
      bg: 'bg-red-600/8',
      pill: 'bg-red-600/15 border-red-600/40 text-red-400',
      icon: 'ShieldExclamationIcon',
      iconColor: 'text-red-400',
      label: 'Critical Fraud Alert',
      sub: 'High probability of identity theft or financial loss. DO NOT INTERACT.',
    },
    greylisted: {
      border: 'border-l-amber-400',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.12)]',
      ring: '#FBBF24',
      ringGlow: 'rgba(251,191,36,0.4)',
      bg: 'bg-amber-400/8',
      pill: 'bg-amber-400/15 border-amber-400/40 text-amber-400',
      icon: 'ExclamationTriangleIcon',
      iconColor: 'text-amber-400',
      label: 'Database Greylist Hit',
      sub: 'Entity registered but has active reports of predatory behavior or training fees.',
    },
    blacklisted: {
      border: 'border-l-red-700',
      glow: 'shadow-[0_0_24px_rgba(153,27,27,0.2)]',
      ring: '#B91C1C',
      ringGlow: 'rgba(153,27,27,0.5)',
      bg: 'bg-red-700/8',
      pill: 'bg-red-700/15 border-red-700/40 text-red-400',
      icon: 'NoSymbolIcon',
      iconColor: 'text-red-400',
      label: 'Database Blacklist Hit',
      sub: 'Confirmed fraud source in our Global Intelligence Database.',
    },
  };

  const normalizedVerdict = (verdict?.toLowerCase() || 'risky') as keyof typeof verdictConfig;
  const config = verdictConfig[normalizedVerdict] || verdictConfig['risky'];
  const displayLabel = customLabel || config.label;

  const circumference = 2 * Math.PI * 22;
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
  const offset = circumference * (1 - clampedScore / 100);

  return (
    <div className={`relative rounded-xl border border-border border-l-4 ${config.border} ${config.bg} ${config.glow} p-5 flex items-center gap-5 overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-top-2 duration-500`}>
      {/* Subtle ambient orb */}
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: config.ring }} />

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0`}>
        <Icon name={config.icon as any} size={22} variant="solid" className={config.iconColor} />
      </div>

      {/* Label + sub */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${config.pill}`}>
            TrustScan AI Verdict
          </span>
        </div>
        <h3 className="text-lg font-headline font-bold text-foreground truncate">{displayLabel}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{config.sub}</p>
      </div>

      {/* Trust Score Ring */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div className="relative w-14 h-14">
          <svg viewBox="0 0 52 52" className="w-full h-full -rotate-90">
            <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            <circle
              cx="26" cy="26" r="22" fill="none"
              stroke={config.ring} strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${config.ringGlow})`, transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold font-mono" style={{ color: config.ring }}>{clampedScore}%</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide">Trust Score</span>
      </div>
    </div>
  );
};

export default VerdictBadge;