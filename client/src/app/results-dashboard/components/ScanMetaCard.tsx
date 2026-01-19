import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ScanMetaProps {
  meta?: {
    source: string;
    textLength: number;
    mimeType?: string;
    timestamp?: string;
    preview?: string;
    producer?: string;
    creator?: string;
    verdictLabel?: string;
  };
}

const ScanMetaCard = ({ meta }: ScanMetaProps) => {
  const [showRaw, setShowRaw] = useState(false);
  
  if (!meta) return null;

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'GOOGLE_VISION': return 'Hybrid AI (Google Vision)';
      case 'TESSERACT': return 'Standard OCR (Offline)';
      case 'PDF_PARSE': return 'PDF Structure Analysis';
      case 'TEXT_INPUT': return 'Direct Text Analysis';
      default: return 'Automated Analysis';
    }
  };

  const getSourceIcon = (source: string) => {
      switch (source) {
          case 'GOOGLE_VISION': return 'CloudIcon';
          case 'TESSERACT': return 'CpuChipIcon';
          default: return 'DocumentMagnifyingGlassIcon';
      }
  };

  return (
    <div className="bg-card rounded-lg p-4 mb-6 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-full">
                <Icon name={getSourceIcon(meta.source) as any} size={20} className="text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Analysis Method</p>
                <p className="font-medium text-foreground">{getSourceLabel(meta.source)}</p>
            </div>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Content Processed</p>
            <p className="font-mono text-foreground">{meta.textLength.toLocaleString()} chars</p>
        </div>
      </div>
      
      {/* File Origin Metadata - Shows Producer if available */}
      {(meta.producer || meta.creator) && (
        <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center space-x-2">
                <Icon name="InformationCircleIcon" size={16} className="text-secondary" />
                <div className="text-xs">
                    <span className="text-muted-foreground uppercase font-bold mr-2">File Origin:</span>
                    <span className="text-foreground font-medium">{meta.producer || meta.creator}</span>
                </div>
            </div>
            {meta.producer?.toLowerCase().includes('canva') && (
                <div className="text-xs text-warning ml-6 mt-1">
                    ⚠️ Design software detected (Canva). Often used for editing.
                </div>
            )}
        </div>
      )}

      {/* Verification Badge */}
      <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="CheckBadgeIcon" size={14} className="text-success" />
            <p className="text-xs text-muted-foreground">
                Document content was successfully extracted.
            </p>
            {meta.preview && (
                <button 
                  onClick={() => setShowRaw(!showRaw)}
                  className="text-xs text-primary hover:underline ml-auto"
                >
                  {showRaw ? 'Hide Raw Content' : 'View Extracted Text'}
                </button>
            )}
          </div>
          
          {showRaw && meta.preview && (
              <div className="bg-muted/50 p-2 rounded-md mt-2">
                  <p className="text-xs font-mono text-muted-foreground break-words whitespace-pre-wrap">
                      {meta.preview}
                  </p>
              </div>
          )}
      </div>
    </div>
  );
};

export default ScanMetaCard;
