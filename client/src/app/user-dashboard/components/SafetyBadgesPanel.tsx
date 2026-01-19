import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  total?: number;
}

interface SafetyBadgesPanelProps {
  badges: Badge[];
}

const SafetyBadgesPanel = ({ badges }: SafetyBadgesPanelProps) => {
  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-foreground">Safety Achievements</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Earn badges by staying vigilant and scanning regularly
          </p>
        </div>
        <div className="p-3 bg-conversion-accent/10 rounded-lg">
          <Icon name="TrophyIcon" size={24} variant="solid" className="text-conversion-accent" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-lg p-4 border-2 transition-all duration-300 ${
              badge.earned
                ? 'border-success-green bg-success-green/5 hover:shadow-brand'
                : 'border-border bg-muted/30 opacity-60'
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-3 ${
                badge.earned ? 'bg-success-green/10' : 'bg-muted'
              }`}>
                <Icon
                  name={badge.icon as any}
                  size={32}
                  variant={badge.earned ? 'solid' : 'outline'}
                  className={badge.earned ? 'text-success-green' : 'text-muted-foreground'}
                />
              </div>
              
              <h3 className={`text-sm font-semibold mb-1 ${
                badge.earned ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {badge.name}
              </h3>
              
              <p className="text-xs text-muted-foreground mb-3">
                {badge.description}
              </p>
              
              {badge.earned && badge.earnedDate ? (
                <div className="flex items-center gap-1 text-xs text-success-green">
                  <Icon name="CheckCircleIcon" size={14} variant="solid" />
                  <span>Earned {badge.earnedDate}</span>
                </div>
              ) : badge.progress !== undefined && badge.total !== undefined ? (
                <div className="w-full">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{badge.progress}/{badge.total}</span>
                    <span>{Math.round((badge.progress / badge.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Locked</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SafetyBadgesPanel;