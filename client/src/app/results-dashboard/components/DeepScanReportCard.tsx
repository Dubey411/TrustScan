'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface DeepScanReportProps {
  deepScanReport?: {
    crossVerification?: any; // Removed — too expensive
    adversarialDebate?: {
      prosecution: string;
      defense: string;
      hasFullDebate: boolean;
      prosecutionStrength?: number;
      defenseStrength?: number;
    };
    forensicReport?: string;
    modelsUsed?: string[];
  };
}

const formatBullets = (text: string) => {
  return text.split('\n').filter(l => l.trim()).map((line, i) => {
    const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
    if (!cleanLine) return null;
    return (
      <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
        <span>{cleanLine}</span>
      </li>
    );
  });
};

import { TypewriterEffect } from '@/components/ui/TypewriterEffect';

const ForensicReportView = ({ text }: { text: string }) => {
  const sections = text.split(/\n(?=[A-Z ]+:)/);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  
  return (
    <>
      {sections.map((section, i) => {
        const match = section.match(/^([A-Z ]+):\s*([\s\S]*)/);
        if (!match) return <p key={i} className="text-sm text-slate-400">{section}</p>;
        
        const sectionTitle = match[1].trim();
        const sectionContent = match[2].trim();
        
        const sectionIcons: Record<string, string> = {
          'IDENTITY ANALYSIS': 'IdentificationIcon',
          'BEHAVIORAL PATTERNS': 'BoltIcon',
          'FINANCIAL RISK': 'CurrencyRupeeIcon',
          'TECHNICAL SIGNALS': 'WrenchScrewdriverIcon',
          'INVESTIGATOR VERDICT': 'ShieldCheckIcon'
        };
        
        const isVerdict = sectionTitle === 'INVESTIGATOR VERDICT';
        
        // Hide sections until it's their turn to animate
        if (i > activeSectionIndex) return null;
        
        return (
          <div key={i} className={`p-4 rounded-xl border ${isVerdict ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-800/30 border-slate-700/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={sectionIcons[sectionTitle] || 'InformationCircleIcon'} size={16} className={isVerdict ? 'text-indigo-400' : 'text-slate-400'} />
              <h5 className={`text-xs font-black uppercase tracking-widest ${isVerdict ? 'text-indigo-400' : 'text-slate-400'}`}>
                {sectionTitle}
              </h5>
            </div>
            
            {i === activeSectionIndex ? (
               <TypewriterEffect 
                  content={sectionContent}
                  speed={8}
                  className={`text-sm leading-relaxed ${isVerdict ? 'text-indigo-200 font-medium' : 'text-slate-300'}`}
                  onComplete={() => setActiveSectionIndex(i + 1)}
               />
            ) : (
               <p className={`text-sm leading-relaxed ${isVerdict ? 'text-indigo-200 font-medium' : 'text-slate-300'}`}>
                 {sectionContent}
               </p>
            )}
          </div>
        );
      })}
    </>
  );
};

export const DeepScanReportCard: React.FC<DeepScanReportProps> = ({ deepScanReport }) => {
  const [activeTab, setActiveTab] = useState<'debate' | 'forensic'>('debate');
  
  if (!deepScanReport) return null;
  const { adversarialDebate, forensicReport } = deepScanReport;
  
  if (!adversarialDebate && !forensicReport) return null;

  // Determine which tab should be default
  const defaultTab = adversarialDebate ? 'debate' : 'forensic';
  
  const tabs = [
    { id: 'debate' as const, label: 'AI Debate', icon: 'ScaleIcon', available: !!adversarialDebate },
    { id: 'forensic' as const, label: 'Forensic Report', icon: 'DocumentMagnifyingGlassIcon', available: !!forensicReport },
  ];

  // Score bar for debate strength
  const debateScore = adversarialDebate ? {
    prosecution: adversarialDebate.prosecutionStrength || 0,
    defense: adversarialDebate.defenseStrength || 0
  } : { prosecution: 0, defense: 0 };
  const totalStrength = debateScore.prosecution + debateScore.defense || 1;
  const prosPercent = Math.round((debateScore.prosecution / totalStrength) * 100);
  const defPercent = 100 - prosPercent;

  return (
    <div className="relative group overflow-hidden border-2 border-purple-500/20 rounded-2xl mb-6 shadow-lg">
      {/* Premium Animated Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl blur-xl opacity-15 group-hover:opacity-30 transition duration-1000 animate-pulse" />
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-blue-900/40 px-6 py-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 text-white shadow-lg shadow-purple-500/30">
                <Icon name="BeakerIcon" size={22} variant="solid" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300">
                  Deep Scan Investigation
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    ML-Powered Forensic Analysis
                  </span>
                </div>
              </div>
            </div>
            
            {deepScanReport.modelsUsed && deepScanReport.modelsUsed.length > 0 && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <Icon name="CpuChipIcon" size={12} className="text-purple-400" />
                <span className="text-[9px] font-black text-purple-300 uppercase tracking-widest font-mono">
                  {deepScanReport.modelsUsed.join(' + ')} + ML Engine
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/50">
          {tabs.filter(t => t.available).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/5'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              }`}
            >
              <Icon name={tab.icon} size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Adversarial Debate Tab */}
          {activeTab === 'debate' && adversarialDebate && (
            <div className="space-y-5">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                Prosecution vs Defense — Built from ML Engine Signals
              </p>

              {/* Strength Bar */}
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
                <span className="text-rose-400">{prosPercent}%</span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-gradient-to-r from-rose-500 to-rose-600 h-full transition-all duration-500" style={{ width: `${prosPercent}%` }} />
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full transition-all duration-500" style={{ width: `${defPercent}%` }} />
                </div>
                <span className="text-emerald-400">{defPercent}%</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prosecution */}
                <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center">
                      <Icon name="ExclamationTriangleIcon" size={16} className="text-rose-400" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Prosecution</span>
                      <p className="text-[10px] text-rose-300/50">Why it could be a scam</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-rose-200/80">
                    {formatBullets(adversarialDebate.prosecution)}
                  </ul>
                </div>

                {/* Defense */}
                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Icon name="ShieldCheckIcon" size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Defense</span>
                      <p className="text-[10px] text-emerald-300/50">Why it could be legitimate</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-emerald-200/80">
                    {formatBullets(adversarialDebate.defense)}
                  </ul>
                </div>
              </div>

              <p className="text-[10px] text-slate-600 text-center mt-2">
                💡 This debate is built from TrustScan&apos;s own ML signals — no extra API calls required.
              </p>
            </div>
          )}

          {/* Forensic Report Tab */}
          {activeTab === 'forensic' && forensicReport && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-4">
                AI-Generated Forensic Analysis — Structured Investigation Report
              </p>
              <div className="space-y-3">
                <ForensicReportView text={forensicReport} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-[0.1em]">
            <Icon name="LockClosedIcon" size={11} className="text-purple-400" />
            <span>Deep Scan Exclusive</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>1 Credit Used</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepScanReportCard;
