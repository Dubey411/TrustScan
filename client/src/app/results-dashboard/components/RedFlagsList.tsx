import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface RedFlag {
  id: number;
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface RedFlagsListProps {
  flags: RedFlag[];
}

const RedFlagsList = ({ flags }: RedFlagsListProps) => {
  const severityConfig = {
    high: {
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error',
      icon: 'ShieldExclamationIcon',
    },
    medium: {
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning',
      icon: 'ExclamationCircleIcon',
    },
    low: {
      bgColor: 'bg-muted',
      textColor: 'text-muted-foreground',
      borderColor: 'border-muted',
      icon: 'InformationCircleIcon',
    },
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-brand border border-border">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-error/10 rounded-lg text-error">
            <Icon name="FlagIcon" size={24} variant="solid" />
        </div>
        <h3 className="text-xl font-headline font-bold text-foreground">
          Critical Red Flags ({flags.length})
        </h3>
      </div>
      <div className="space-y-4">
        {flags.map((flag) => {
          const config = severityConfig[flag.severity];
          return (
            <div
              key={flag.id}
              className={`${config.bgColor} border ${config.borderColor}/20 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-subtle group`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className={`${config.textColor} mt-1 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon name={config.icon as any} size={24} variant="solid" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <span className="font-headline font-bold text-base text-foreground">
                      {flag.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border tracking-widest ${config.textColor} ${config.bgColor} ${config.borderColor}/30`}
                    >
                      {flag.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed font-medium">{flag.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RedFlagsList;