'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ShareResultsProps {
  scanId: string;
  verdict: string;
}

const ShareResults = ({ scanId, verdict }: ShareResultsProps) => {
  const [copied, setCopied] = useState(false);
  const [showPrivacyNote, setShowPrivacyNote] = useState(false);

  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setShareUrl(`${origin}/results/${scanId}`);
    }
  }, [scanId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `I just scanned a document on TrustScan and it was marked as ${verdict}. Check it out!`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`,
    };
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-brand relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Icon name="ShareIcon" size={20} variant="solid" />
            </div>
            <h3 className="text-lg font-headline font-bold text-foreground">Share Analysis</h3>
          </div>
          <button
            onClick={() => setShowPrivacyNote(!showPrivacyNote)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Toggle privacy information"
          >
            <Icon name="InformationCircleIcon" size={18} variant="outline" />
          </button>
        </div>

        {showPrivacyNote && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3">
              <Icon name="LockClosedIcon" size={16} variant="solid" className="text-primary flex-shrink-0" />
              <p>Your personal data is never shared. Only the fraud verdict and security signals are visible to others.</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full pl-4 pr-10 py-3 bg-muted/50 border border-border rounded-xl text-xs font-mono text-muted-foreground focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                 <Icon name="LinkIcon" size={14} />
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={18} />
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-3 px-4 py-3 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all group/btn"
            >
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform text-white">
                <Icon name="ChatBubbleLeftEllipsisIcon" size={16} variant="solid" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">X / Twitter</span>
            </button>
            
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center gap-3 px-4 py-3 bg-[#25D366] text-white rounded-xl hover:bg-[#20bd5a] transition-all group/btn"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <Icon name="PhoneIcon" size={16} variant="solid" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">WhatsApp</span>
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center gap-3 px-4 py-3 bg-[#0A66C2] text-white rounded-xl hover:bg-[#08529d] transition-all group/btn"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <Icon name="BriefcaseIcon" size={16} variant="solid" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">LinkedIn</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#1464cc] transition-all group/btn"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <Icon name="UserGroupIcon" size={16} variant="solid" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Facebook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ShareResults;