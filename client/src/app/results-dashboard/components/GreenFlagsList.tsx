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
    <div className="bg-card rounded-2xl p-6 shadow-brand border border-success/30 mb-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-success/10 transition-colors" />
      
      <div className="relative z-10 flex items-center space-x-3 mb-6">
        <div className="p-2 bg-success/10 rounded-lg text-success">
            <Icon name="CheckCircleIcon" size={24} variant="solid" />
        </div>
        <h3 className="text-xl font-headline font-bold text-foreground">
          Trust Indicators ({flags.length})
        </h3>
      </div>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {flags.map((flag, index) => (
          <div
            key={index}
            className="bg-success/5 border border-success/10 rounded-xl p-4 transition-all duration-300 hover:shadow-subtle hover:bg-success/10 flex items-start gap-3"
          >
            <Icon
                name="ShieldCheckIcon"
                size={18}
                variant="solid"
                className="text-success mt-0.5 flex-shrink-0"
            />
            <p className="text-sm font-bold text-foreground/80 leading-snug">{flag}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GreenFlagsList;
