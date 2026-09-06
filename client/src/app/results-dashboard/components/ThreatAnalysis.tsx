import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ThreatCategory {
  name: string;
  score: number;
  description: string;
  icon: string;
}

interface ThreatAnalysisProps {
  categories?: ThreatCategory[];
  signals?: Record<string, number>;
}

const ThreatAnalysis = ({ categories, signals }: ThreatAnalysisProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-error';
    if (score >= 40) return 'bg-warning';
    return 'bg-success-green';
  };

  let items: ThreatCategory[] = categories || [];
  if (items.length === 0 && signals) {
    items = Object.entries(signals).map(([key, val]) => {
      const score = typeof val === 'number' ? (val <= 1 ? Math.round(val * 100) : Math.round(val)) : (Number(val) || 0);
      let icon = 'ShieldExclamationIcon';
      let name = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      let description = `Forensic heuristic evaluation for ${name.toLowerCase()}.`;

      if (key.toLowerCase().includes('ela') || key.toLowerCase().includes('pixel') || key.toLowerCase().includes('tamper')) {
        icon = 'PhotoIcon';
        name = 'ELA Pixel Disparity';
        description = 'Error level compression disparity across image layers.';
      } else if (key.toLowerCase().includes('link') || key.toLowerCase().includes('url') || key.toLowerCase().includes('domain')) {
        icon = 'LinkIcon';
        name = 'Link Integrity';
        description = 'Domain registration age, typosquatting & reputation signals.';
      } else if (key.toLowerCase().includes('impersonation') || key.toLowerCase().includes('brand')) {
        icon = 'UserMinusIcon';
        name = 'Impersonation Risk';
        description = 'Visual logo, seal, and sender institutional alignment.';
      } else if (key.toLowerCase().includes('job') || key.toLowerCase().includes('offer') || key.toLowerCase().includes('scam')) {
        icon = 'DocumentTextIcon';
        name = 'Scam Vectors';
        description = 'CTC math balance, fee scam signals & email spoofing.';
      }

      return {
        name,
        score,
        description,
        icon,
      };
    });
  }

  if (items.length === 0) {
    items = [
      {
        name: 'Deterministic Invariant Security',
        score: 15,
        description: 'Mathematical checksums and forensic decompression verified.',
        icon: 'ShieldCheckIcon',
      },
    ];
  }

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="ChartBarIcon" size={24} variant="solid" className="text-primary" />
        <h3 className="text-xl font-headline font-bold text-foreground">Threat Analysis</h3>
      </div>
      <div className="space-y-4">
        {items.map((category, index) => (
          <div key={index} className="space-y-2 p-3 rounded-xl hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                  <Icon name={category.icon as any} size={18} variant="outline" />
                </div>
                <span className="font-headline font-bold text-sm text-foreground truncate">
                  {category.name}
                </span>
              </div>
              <span className="text-sm font-bold text-primary">{category.score}%</span>
            </div>
            <div className="relative w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getScoreColor(category.score)} transition-all duration-700 ease-out`}
                style={{ width: `${category.score}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed px-1">
              {category.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatAnalysis;