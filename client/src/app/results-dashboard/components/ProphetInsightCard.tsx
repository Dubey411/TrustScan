import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface ProphetInsightCardProps {
  insight: string;
}

export const ProphetInsightCard = ({ insight }: ProphetInsightCardProps) => {
  if (!insight) return null;
  return (
    <div className="relative group overflow-hidden border-2 border-indigo-500/20 rounded-2xl mb-6 shadow-sm">
      {/* Premium Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      
      <div className="relative flex flex-col p-6 bg-slate-900 border border-slate-800 rounded-2xl leading-relaxed shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Icon name="SparklesIcon" size={20} variant="solid" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
                 Prophet AI Insight
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                 <span className="flex w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                   Contextual Analysis Complete
                 </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700">
             <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Layer v4</span>
          </div>
        </div>

        <div className="relative">
          {insight ? (
            <p className="text-slate-200 font-medium md:text-lg italic leading-relaxed pl-4 border-l-2 border-indigo-500/50 tracking-tight min-h-[3rem]">
              "{insight}"
            </p>
          ) : (
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-slate-700">
               <div className="h-4 w-3/4 bg-slate-800 animate-pulse rounded" />
               <div className="h-4 w-1/2 bg-slate-800 animate-pulse rounded" />
               <p className="text-[10px] text-slate-500 italic mt-2 animate-pulse">Connecting to Gemini High-Confidence Layer...</p>
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                    <div className={`w-full h-full bg-gradient-to-br ${i === 1 ? 'from-blue-500 to-indigo-500' : i === 2 ? 'from-purple-500 to-pink-500' : 'from-indigo-500 to-purple-500'} opacity-50`} />
                  </div>
                ))}
             </div>
             <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Deep Verification Protocol</span>
          </div>
          
          <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
             <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700/50">Gemini Flash Core</span>
             <span className="w-1 h-1 rounded-full bg-slate-700" />
             <span className="hover:text-indigo-400 transition-colors cursor-default underline decoration-slate-800 underline-offset-4">Learn How This Works</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProphetInsightCard;
