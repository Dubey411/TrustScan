
import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface TrustScanReportProps {
  report?: {
    recommendation: string;
    color: 'red' | 'yellow' | 'green';
    why: string[];
    intent: string;
    advice: string;
  };
}

const TrustScanReportCard = ({ report }: TrustScanReportProps) => {
  if (!report) return null;

  const config = {
    red: {
      bg: 'bg-error/5',
      border: 'border-error/20',
      text: 'text-error',
      icon: 'ShieldExclamationIcon',
      badge: 'bg-error text-white'
    },
    yellow: {
      bg: 'bg-warning/5',
      border: 'border-warning/20',
      text: 'text-warning',
      icon: 'ExclamationTriangleIcon',
      badge: 'bg-warning text-black'
    },
    green: {
      bg: 'bg-success/5',
      border: 'border-success/20',
      text: 'text-success',
      icon: 'CheckCircleIcon',
      badge: 'bg-success text-white'
    }
  };

  const { bg, border, text, icon, badge } = config[report.color] || config.yellow;

  return (
    <div className={`rounded-2xl border ${border} ${bg} p-6 shadow-sm overflow-hidden relative`}>
      {/* Decorative Background Icon */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12">
        <Icon name={icon as any} size={160} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
             <div className={`${text} p-2 bg-background shadow-subtle rounded-xl`}>
                <Icon name={icon as any} size={28} variant="solid" />
             </div>
             <div>
                <h3 className="text-xl font-headline font-bold text-foreground">Official TrustScan Verdict</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Simple, Real-world Guidance</p>
             </div>
          </div>
          <div className={`${badge} px-6 py-2 rounded-full font-headline font-extrabold text-lg shadow-lg animate-pulse`}>
             {report.recommendation}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Why Section */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
              <Icon name="QuestionMarkCircleIcon" size={16} />
              Reasoning
            </h4>
            <ul className="space-y-3">
              {report.why.map((reason, i) => (
                <li key={i} className="flex items-start gap-3 group">
                   <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:scale-150 transition-transform" />
                   <p className="text-foreground/80 text-sm leading-relaxed">{reason}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Intent & Advice Section */}
          <div className="space-y-6">
             <div className="bg-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Intent Detection</h4>
                <p className="text-sm font-medium text-foreground">{report.intent}</p>
             </div>

             <div className="bg-primary/10 rounded-xl p-5 border border-primary/20">
                <h4 className="flex items-center gap-2 text-sm font-bold text-primary uppercase mb-2">
                  <Icon name="LightBulbIcon" size={16} variant="solid" />
                  TrustScan Advice
                </h4>
                <p className="text-sm font-bold text-foreground leading-relaxed">
                   {report.advice}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScanReportCard;
