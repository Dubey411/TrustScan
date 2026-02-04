'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface LinkInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onScan?: () => void;
}

export default function LinkInputArea({ value, onChange, placeholder, onScan }: LinkInputAreaProps) {
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = (url: string) => {
    if (!url) {
      setIsValidUrl(true);
      return;
    }
    const normalized = url.includes('://') ? url : `http://${url}`;
    try {
      new URL(normalized);
      setIsValidUrl(true);
    } catch {
      setIsValidUrl(false);
    }
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