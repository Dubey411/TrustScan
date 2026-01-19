import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface GreenFlag {
  id: number;
  description: string;
}

interface GreenFlagsListProps {
  flags: string[];
}

const GreenFlagsList = ({ flags }: GreenFlagsListProps) => {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand border border-success/20 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="CheckCircleIcon" size={24} variant="solid" className="text-success" />
        <h3 className="text-xl font-headline font-bold text-foreground">
          Trust Indicators ({flags.length})
        </h3>
      </div>
      <div className="space-y-3">
        {flags.map((flag, index) => (
          <div
            key={index}
            className="bg-success/5 border border-success/20 rounded-md p-4 transition-all duration-300 hover:shadow-subtle"
          >
            <div className="flex items-start space-x-3">
              <Icon
                name="ShieldCheckIcon"
                size={20}
                variant="solid"
                className="text-success"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{flag}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GreenFlagsList;
