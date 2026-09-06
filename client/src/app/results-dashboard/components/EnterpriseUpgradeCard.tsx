'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function EnterpriseUpgradeCard() {
  const enterpriseFeatures = [
    {
      icon: 'BoltIcon',
      title: 'Real-time Processing',
      description: 'Under 1s ultra-low latency response times',
      color: 'bg-[#FF6B4A]/15 text-[#FF6B4A] border-[#FF6B4A]/30',
    },
    {
      icon: 'ShieldCheckIcon',
      title: '99.2%+ Forensic Accuracy',
      description: 'Zero-leakage empirical logistic calibration',
      color: 'bg-[#818CF8]/15 text-[#818CF8] border-[#818CF8]/30',
    },
    {
      icon: 'ScissorsIcon',
      title: 'Deep ELA & Tamper Heatmaps',
      description: 'Sub-pixel JPEG compression & font anomaly maps',
      color: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
    },
    {
      icon: 'ServerStackIcon',
      title: 'Batch REST API & Webhooks',
      description: 'High-throughput enterprise verification pipeline',
      color: 'bg-[#4ADE80]/15 text-[#4ADE80] border-[#4ADE80]/30',
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top CTA Banner */}
      <div className="space-y-3">
        <h3 className="text-xl font-headline font-bold text-foreground leading-snug">
          Want faster speeds, on-site deployment, and deeper accuracy?
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
          Our sovereign enterprise models consistently outperform standard heuristics. Whether you need automated fraud prevention, compliance audits, or batch API integration, we can help.
        </p>

        <div className="pt-2">
          <Link
            href="/contact"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-primary hover:bg-primary/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,107,74,0.35)] hover:shadow-[0_0_28px_rgba(255,107,74,0.5)]"
          >
            <Icon name="EnvelopeIcon" size={18} />
            <span>Contact Enterprise Sales</span>
          </Link>
        </div>
      </div>

      {/* Enterprise Plan Features List */}
      <div className="pt-4 border-t border-border space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Enterprise Plan Features
        </h4>

        <div className="space-y-3">
          {enterpriseFeatures.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-border/60 hover:border-border transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${feat.color}`}>
                <Icon name={feat.icon as any} size={18} />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-foreground font-headline truncate">
                  {feat.title}
                </div>
                <div className="text-xs text-muted-foreground font-body">
                  {feat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
