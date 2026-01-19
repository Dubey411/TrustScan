'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ShareResultsProps {
  scanId: string;
  verdict: string;
}

const ShareResults = ({ scanId, verdict }: ShareResultsProps) => {
  const [copied, setCopied] = useState(false);
  const [showPrivacyNote, setShowPrivacyNote] = useState(false);

  const shareUrl = `https://trustscan.ai/results/${scanId}`;

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
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="ShareIcon" size={24} variant="solid" className="text-primary" />
          <h3 className="text-xl font-headline font-bold text-foreground">Share Results</h3>
        </div>
        <button
          onClick={() => setShowPrivacyNote(!showPrivacyNote)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle privacy information"
        >
          <Icon name="InformationCircleIcon" size={18} variant="outline" />
        </button>
      </div>

      {showPrivacyNote && (
        <div className="bg-muted border border-border rounded-md p-3 mb-4 text-xs text-muted-foreground">
          <Icon name="LockClosedIcon" size={16} variant="outline" className="inline mr-1" />
          Your personal information is never shared. Only the scan verdict is visible to others.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-2 bg-muted border border-border rounded-md text-sm text-foreground"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-trust-blue transition-all duration-300 flex items-center space-x-2"
            aria-label="Copy share link"
          >
            <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={18} variant="outline" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleShare('twitter')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#1DA1F2] text-white rounded-md hover:opacity-90 transition-all duration-300"
            aria-label="Share on Twitter"
          >
            <Icon name="ChatBubbleLeftIcon" size={18} variant="solid" />
            <span className="text-sm font-medium">Twitter</span>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#1877F2] text-white rounded-md hover:opacity-90 transition-all duration-300"
            aria-label="Share on Facebook"
          >
            <Icon name="UserGroupIcon" size={18} variant="solid" />
            <span className="text-sm font-medium">Facebook</span>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#0A66C2] text-white rounded-md hover:opacity-90 transition-all duration-300"
            aria-label="Share on LinkedIn"
          >
            <Icon name="BriefcaseIcon" size={18} variant="solid" />
            <span className="text-sm font-medium">LinkedIn</span>
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-[#25D366] text-white rounded-md hover:opacity-90 transition-all duration-300"
            aria-label="Share on WhatsApp"
          >
            <Icon name="ChatBubbleOvalLeftEllipsisIcon" size={18} variant="solid" />
            <span className="text-sm font-medium">WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareResults;