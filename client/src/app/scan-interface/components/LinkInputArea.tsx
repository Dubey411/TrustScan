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
    
    // Stricter Regex for URLs (requires at least one dot and some characters)
    const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-\.\/?%&=]*)?$/i;
    const isValid = urlPattern.test(url.trim());
    
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