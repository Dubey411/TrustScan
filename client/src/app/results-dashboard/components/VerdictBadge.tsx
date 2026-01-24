import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface VerdictBadgeProps {
  verdict: 'safe' | 'risky' | 'scam' | 'fraud' | 'suspicious';
  score: number;
  type?: string;
  customLabel?: string;
}

const VerdictBadge = ({ verdict, score, type, customLabel }: VerdictBadgeProps) => {
  const isDocument = type === 'document';

  const verdictConfig = {
    safe: {
      bgColor: 'bg-success-green',
      textColor: 'text-success-green-foreground',
      borderColor: 'border-success-green',
      icon: 'CheckCircleIcon',
      label: isDocument ? 'Legitimate Document' : 'Safe',
      description: isDocument ? 'Metadata and content appear authentic' : 'This opportunity appears legitimate',
    },
    risky: {
      bgColor: 'bg-warning',
      textColor: 'text-warning-foreground',
      borderColor: 'border-warning',
      icon: 'ExclamationTriangleIcon',
      label: isDocument ? 'Authentic / Risky Content' : 'Risky',
      description: isDocument ? 'Structure appears valid but content triggered fraud alerts' : 'Proceed with caution - some red flags detected',
    },
    suspicious: {
      bgColor: 'bg-warning',
      textColor: 'text-warning-foreground',
      borderColor: 'border-warning',
      icon: 'ExclamationTriangleIcon',
      label: isDocument ? 'Suspicious Content' : 'Suspicious',
      description: isDocument ? 'Potential threat detected within the document text' : 'Proceed with caution - potential threats detected',
    },
    action_required: {
      bgColor: 'bg-warning',
      textColor: 'text-warning-foreground',
      borderColor: 'border-warning',
      icon: 'MagnifyingGlassIcon',
      label: 'Action Required',
      description: 'Please provide missing details to complete verification',
    },
    scam: {
      bgColor: 'bg-error',
      textColor: 'text-error-foreground',
      borderColor: 'border-error',
      icon: 'XCircleIcon',
      label: isDocument ? 'Synthetic Content' : 'Scam Detected',
      description: isDocument ? 'High probability of AI generation or forgery' : 'High probability of fraudulent activity',
    },
    fraud: {
      bgColor: 'bg-error',
      textColor: 'text-error-foreground',
      borderColor: 'border-error',
      icon: 'XCircleIcon',
      label: isDocument ? 'Synthetic / Manipulated' : 'Fraud Detected',
      description: isDocument ? 'High probability of AI generation or forgery' : 'High probability of fraudulent activity',
    },
  };

  const normalizedVerdict = (verdict?.toLowerCase() || 'risky') as keyof typeof verdictConfig;
  const config = verdictConfig[normalizedVerdict] || verdictConfig['risky'];

  // Override label if customLabel provided (from backend analysis)
  const displayLabel = customLabel || config.label;

  return (
    <div className={`${config.bgColor} ${config.textColor} rounded-2xl p-6 shadow-brand transition-all duration-300`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
          <div className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse-subtle">
            <Icon name={config.icon as any} size={32} variant="solid" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-headline font-bold mb-1">{displayLabel}</h2>
            <p className="text-sm opacity-90 max-w-sm">{config.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-end text-center sm:text-right border-t sm:border-t-0 sm:border-l border-white/20 pt-4 sm:pt-0 sm:pl-8 w-full sm:w-auto">
          <div className="text-4xl sm:text-5xl font-headline font-bold mb-1">{score}%</div>
          <div className="text-[10px] sm:text-xs uppercase font-bold tracking-widest opacity-80">Fraud Risk Score</div>
        </div>
      </div>
    </div>
  );
};

export default VerdictBadge;