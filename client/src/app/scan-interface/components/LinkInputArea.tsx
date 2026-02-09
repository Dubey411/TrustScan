'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LinkInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onScan?: () => void;
  onValidChange?: (isValid: boolean) => void;
}

export default function LinkInputArea({ value, onChange, placeholder, onScan, onValidChange }: LinkInputAreaProps) {
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (url: string) => {
    if (!url) {
      setIsValidUrl(true);
      if (onValidChange) onValidChange(true);
      return;
    }

    // 1. Anti-Gibberish (Keyboard Mashing) Detection
    const vowelCount = (url.match(/[aeiouy]/gi) || []).length;
    const consonantCount = (url.match(/[bcdfghjklmnpqrstvwxz]/gi) || []).length;
    const vowelRatio = vowelCount / (vowelCount + consonantCount || 1);
    const isMash = url.length > 15 && vowelRatio < 0.1 && !url.includes(' ');

    if (isMash) {
      setIsValidUrl(false);
      if (onValidChange) onValidChange(false);
      return;
    }

    // 2. Stricter URL structure check
    // Includes local ccTLDs and modern deployment TLDs (vercel, github.io, etc)
    const hasProtocol = /^(https?:\/\/|www\.)/i.test(url);
    const commonTlds = /\.(com|net|org|in|co|io|ly|ai|me|info|biz|site|online|top|xyz|gov|ac|edu|ru|ua|tw|cn|uk|pk|jp|de|fr|br|ca|au|us|app|dev|page|link)$/i;
    const genericUrlPattern = /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,12}(\/.*)?$/i;
    
    // Support for common subdomains like .vercel.app, .github.io, .netlify.app
    const isModernDeploy = /\.(vercel\.app|github\.io|netlify\.app|pages\.dev|web\.app|firebaseapp\.com)$/i.test(url);
    
    const isValid = hasProtocol 
      ? genericUrlPattern.test(url.trim()) 
      : (genericUrlPattern.test(url.trim()) && (commonTlds.test(url.trim()) || isModernDeploy));
    
    setIsValidUrl(isValid);
    if (onValidChange) onValidChange(isValid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    validateUrl(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Icon name="LinkIcon" size={20} variant="outline" className="text-muted-foreground" />
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder || "https://example.com/job-offer"}
          className={`w-full pl-12 pr-4 py-3 border-2 rounded-lg transition-all duration-300 font-body text-foreground placeholder:text-muted-foreground ${
            !isValidUrl
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' :'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onScan) {
              onScan();
            }
          }}
          aria-label="URL input field"
          aria-invalid={!isValidUrl}
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setIsValidUrl(true);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors duration-300"
            aria-label="Clear input"
          >
            <Icon name="XMarkIcon" size={20} variant="outline" className="text-muted-foreground" />
          </button>
        )}
      </div>
      {!isValidUrl && (
        <div className="flex items-center space-x-2 text-error text-sm">
          <Icon name="ExclamationCircleIcon" size={16} variant="solid" />
          <span>Please enter a valid URL</span>
        </div>
      )}
      <p className="text-sm text-muted-foreground">Paste the suspicious link or job posting URL</p>
    </div>
  );
}