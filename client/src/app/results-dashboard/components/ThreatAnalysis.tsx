import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ThreatCategory {
  name: string;
  score: number;
  description: string;
  icon: string;
}

interface ThreatAnalysisProps {
  categories: ThreatCategory[];
}

const ThreatAnalysis = ({ categories }: ThreatAnalysisProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-error';
    if (score >= 40) return 'bg-warning';
    return 'bg-success-green';
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="ChartBarIcon" size={24} variant="solid" className="text-primary" />
        <h3 className="text-xl font-headline font-bold text-foreground">Threat Analysis</h3>
      </div>
      <div className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name={category.icon as any} size={18} variant="outline" />
                <span className="font-headline font-semibold text-sm text-foreground">
                  {category.name}
                </span>
              </div>
              <span className="text-sm font-medium text-muted-foreground">{category.score}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getScoreColor(category.score)} transition-all duration-500`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatAnalysis;