import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ActivityItem {
  id: number;
  type: 'scan' | 'threat' | 'upgrade' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  status: 'safe' | 'risky' | 'scam' | 'info';
}

interface RecentActivityTimelineProps {
  activities: ActivityItem[];
}

const RecentActivityTimeline = ({ activities }: RecentActivityTimelineProps) => {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'safe': return 'bg-success-green text-white';
      case 'risky': return 'bg-warning text-white';
      case 'scam': return 'bg-error text-white';
      default: return 'bg-primary text-white';
    }
  };

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'scan': return 'MagnifyingGlassIcon';
      case 'threat': return 'ExclamationTriangleIcon';
      case 'upgrade': return 'SparklesIcon';
      case 'achievement': return 'TrophyIcon';
      default: return 'BellIcon';
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-headline font-bold text-foreground">Recent Activity</h2>
        <button className="text-sm text-primary hover:text-trust-blue font-medium transition-colors duration-300">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                <Icon name={getActivityIcon(activity.type) as any} size={16} variant="solid" />
              </div>
              {index !== activities.length - 1 && (
                <div className="w-0.5 h-full bg-border mt-2"></div>
              )}
            </div>
            
            <div className="flex-1 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityTimeline;