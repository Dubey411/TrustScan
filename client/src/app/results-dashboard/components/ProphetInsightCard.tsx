import React from 'react';
import Icon from '@/components/ui/AppIcon';

/**
 * ProphetInsightCard Component
 * 
 * Displays deep synthesis from TrustScan's Prophet AI intelligence layer:
 * - Multi-stage forensic reasoning distilled into actionable citizen guidance
 * - Model cascade transparency indicating analysis depth
 */
interface ProphetInsightCardProps {
  insight: string;
  modelUsed?: string;
}

export const ProphetInsightCard = ({ insight, modelUsed }: ProphetInsightCardProps) => {
  if (!insight) return null;
  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/[0.15] p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Icon name="SparklesIcon" size={13} variant="solid" />
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-300">
            Prophet AI Insight
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/70 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
          {modelUsed && modelUsed.includes('Heuristic') ? 'Safety Rules' : 'Neural Inference'}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-2.5 border-l-2 border-indigo-500/40 font-body">
        {insight}
      </p>
    </div>
  );
};

export default ProphetInsightCard;
