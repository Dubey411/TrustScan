import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

interface QuickStatsWidgetProps {
  stats: StatCardProps[];
}

const StatCard = ({ icon, label, value, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-brand hover:shadow-brand-elevated transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon name={icon as any} size={24} variant="outline" className="text-primary" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-success-green' : 'text-error'}`}>
            <Icon name={trendUp ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} size={14} variant="solid" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-headline font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

const QuickStatsWidget = ({ stats }: QuickStatsWidgetProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default QuickStatsWidget;