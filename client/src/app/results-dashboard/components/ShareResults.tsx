'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ShareResultsProps {
  scanId: string;
  verdict: string;
}

const ShareResults = ({ scanId, verdict }: ShareResultsProps) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(`${window.location.origin}/results/${scanId}`);
    }
  }, [scanId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `I verified a document on TrustScan AI — verdict: ${verdict}. Check it out!`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const platforms = [
    { key: 'twitter', label: 'X / Twitter', icon: 'ChatBubbleLeftEllipsisIcon', color: 'text-white', bg: 'bg-white/[0.06] hover:bg-white/[0.12] border-white/[0.08]' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'PhoneIcon', color: 'text-[#4ADE80]', bg: 'bg-[#4ADE80]/[0.06] hover:bg-[#4ADE80]/[0.12] border-[#4ADE80]/20' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'BriefcaseIcon', color: 'text-[#818CF8]', bg: 'bg-[#818CF8]/[0.06] hover:bg-[#818CF8]/[0.12] border-[#818CF8]/20' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-[#818CF8]/15 border border-[#818CF8]/30 flex items-center justify-center">
          <Icon name="ShareIcon" size={20} className="text-[#818CF8]" />
        </div>
        <span className="text-sm font-semibold text-white">Share Analysis</span>
      </div>

      {/* Copy Link Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full pl-3 pr-8 py-2 bg-[#0A0B0F] border border-border rounded-lg text-[11px] font-mono text-muted-foreground focus:outline-none truncate"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 pointer-events-none">
            <Icon name="LinkIcon" size={13} />
          </div>
        </div>
        <button
          onClick={handleCopyLink}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
            copied
              ? 'bg-[#4ADE80]/15 border-[#4ADE80]/40 text-[#4ADE80]'
              : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
          }`}
        >
          <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={14} />
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Social Share Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {platforms.map((p) => (
          <button
            key={p.key}
            onClick={() => handleShare(p.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all duration-200 ${p.bg} ${p.color}`}
          >
            <Icon name={p.icon as any} size={16} />
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ShareResults;