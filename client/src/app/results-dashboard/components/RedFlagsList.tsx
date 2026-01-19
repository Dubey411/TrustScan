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
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="FlagIcon" size={24} variant="solid" className="text-error" />
        <h3 className="text-xl font-headline font-bold text-foreground">
          Red Flags Detected ({flags.length})
        </h3>
      </div>
      <div className="space-y-3">
        {flags.map((flag) => {
          const config = severityConfig[flag.severity];
          return (
            <div
              key={flag.id}
              className={`${config.bgColor} border ${config.borderColor} rounded-md p-4 transition-all duration-300 hover:shadow-subtle`}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  name={config.icon as any}
                  size={20}
                  variant="solid"
                  className={config.textColor}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-headline font-semibold text-sm text-foreground">
                      {flag.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${config.textColor} ${config.bgColor}`}
                    >
                      {flag.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
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