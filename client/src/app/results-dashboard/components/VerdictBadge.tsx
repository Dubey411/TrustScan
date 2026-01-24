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
    <div className={`${config.bgColor} ${config.textColor} rounded-lg p-6 shadow-brand`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon name={config.icon as any} size={32} variant="solid" />
          <div>
            <h2 className="text-2xl font-headline font-bold">{displayLabel}</h2>
            <p className="text-sm opacity-90">{config.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-headline font-bold">{score}%</div>
          <div className="text-xs opacity-80">Fraud Risk Score</div>
        </div>
      </div>
    </div>
  );
};

export default VerdictBadge;