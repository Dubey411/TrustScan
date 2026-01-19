import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface WelcomeSectionProps {
  userName: string;
  memberSince: string;
  safetyScore: number;
}

const WelcomeSection = ({ userName, memberSince, safetyScore }: WelcomeSectionProps) => {
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-success-green';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-success-green/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="bg-gradient-to-br from-primary to-trust-indigo rounded-xl p-8 text-white shadow-brand-elevated">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="ShieldCheckIcon" size={32} variant="solid" className="text-success-green" />
            <h1 className="text-3xl font-headline font-bold">Welcome back, {userName}!</h1>
          </div>
          <p className="text-primary-foreground/80 text-sm">
            Member since {memberSince} • Protecting your career journey
          </p>
        </div>
        
        <div className={`${getScoreBgColor(safetyScore)} rounded-lg p-6 min-w-[200px]`}>
          <div className="text-center">
            <p className="text-xs text-white/70 mb-2 font-medium">Your Safety Score</p>
            <div className={`text-5xl font-headline font-bold ${getScoreColor(safetyScore)}`}>
              {safetyScore}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Icon name="TrophyIcon" size={16} variant="solid" className="text-conversion-accent" />
              <span className="text-xs text-white/70">Keep scanning to improve!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;