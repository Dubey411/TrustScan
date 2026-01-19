import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface Feature {
  name: string;
  icon: string;
}

interface UpgradePromptProps {
  features: Feature[];
}

const UpgradePrompt = ({ features }: UpgradePromptProps) => {
  return (
    <div className="bg-gradient-to-br from-primary to-secondary rounded-lg p-6 shadow-brand-elevated text-primary-foreground">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-headline font-bold mb-2">Unlock Premium Features</h3>
          <p className="text-sm opacity-90">
            Get unlimited scans, detailed reports, and priority support
          </p>
        </div>
        <Icon name="SparklesIcon" size={32} variant="solid" className="opacity-80" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Icon name={feature.icon as any} size={18} variant="solid" className="opacity-80" />
            <span className="text-sm font-medium">{feature.name}</span>
          </div>
        ))}
      </div>
      <Link
        href="/pricing-page"
        className="block w-full bg-primary-foreground text-primary text-center py-3 rounded-md font-headline font-semibold hover:bg-opacity-90 transition-all duration-300 hover:-translate-y-0.5"
      >
        View Pricing Plans
      </Link>
    </div>
  );
};

export default UpgradePrompt;