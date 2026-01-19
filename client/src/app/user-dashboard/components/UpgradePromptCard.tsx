'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

interface UpgradePromptCardProps {
  scansRemaining: number;
  totalScans: number;
  planName: string;
}

const UpgradePromptCard = ({ scansRemaining, totalScans, planName }: UpgradePromptCardProps) => {
  const router = useRouter();
  const usagePercentage = ((totalScans - scansRemaining) / totalScans) * 100;

  const handleUpgradeClick = () => {
    router.push('/pricing-page');
  };

  return (
    <div className="bg-gradient-to-br from-conversion-accent to-warning rounded-lg p-6 shadow-brand-elevated">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-headline font-bold text-white mb-1">
            {planName} Plan
          </h3>
          <p className="text-sm text-white/80">
            {scansRemaining} of {totalScans} scans remaining
          </p>
        </div>
        <div className="p-2 bg-white/20 rounded-lg">
          <Icon name="BoltIcon" size={24} variant="solid" className="text-white" />
        </div>
      </div>
      
      <div className="mb-4">
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-white/90">
          <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-white" />
          <span>Unlimited scans with Premium</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/90">
          <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-white" />
          <span>Detailed threat analysis reports</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/90">
          <Icon name="CheckCircleIcon" size={16} variant="solid" className="text-white" />
          <span>Priority support & alerts</span>
        </div>
      </div>
      
      <button
        onClick={handleUpgradeClick}
        className="w-full bg-white text-conversion-accent font-headline font-semibold py-3 rounded-lg hover:bg-white/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
      >
        <Icon name="SparklesIcon" size={18} variant="solid" />
        Upgrade to Premium
      </button>
    </div>
  );
};

export default UpgradePromptCard;