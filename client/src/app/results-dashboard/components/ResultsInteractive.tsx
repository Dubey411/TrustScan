'use client';

import { useState, useEffect } from 'react';
import VerdictBadge from './VerdictBadge';
import RedFlagsList from './RedFlagsList';
import GreenFlagsList from './GreenFlagsList';
import ScanMetaCard from './ScanMetaCard'; // New Component
import ThreatAnalysis from './ThreatAnalysis';
import RecommendedActions from './RecommendedActions';
import UpgradePrompt from './UpgradePrompt';
import ShareResults from './ShareResults';
import DownloadReport from './DownloadReport';
import LinkAnalysisCard from './LinkAnalysisCard';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import { API_BASE_URL } from '@/api/scan';
import Icon from '@/components/ui/AppIcon';

interface RedFlag {
  id: number;
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface ThreatCategory {
  name: string;
  score: number;
  description: string;
  icon: string;
}

interface Action {
  id: number;
  title: string;
  description: string;
  priority: 'critical' | 'important' | 'recommended';
  completed: boolean;
}

interface ScamExample {
  id: number;
  title: string;
  description: string;
  image: string;
  alt: string;
  dateReported: string;
  victimsCount: number;
}

interface Feature {
  name: string;
  icon: string;
}

  interface ResultsInteractiveProps {
  scanData?: {
    id: number | string;
    target: string;
    scanType?: string;
    result: 'safe' | 'risky' | 'scam' | 'fraud' | 'suspicious';
    confidence?: number;
    date?: string;
    reasons?: string[];
    flags?: {
        red: string[];
        green: string[];
    };
    signals?: Record<string, number>;
    scanMeta?: {
        source: string;
        textLength: number;
        mimeType?: string;
        timestamp?: string;
        preview?: string;
        producer?: string;
        creator?: string;
        verdictLabel?: string;
    };
    metadata?: {
      linkCount?: number;
      detectedLinks?: Array<{
        url: string;
        host: string;
        flags: string[];
      }>;
      entityCount?: number;
      detectedEntities?: Array<{
        type: string;
        value: string;
        isValid: boolean;
        portalUrl: string;
        label: string;
      }>;
    };
    recommendation?: Action[];
  };
}

const ResultsInteractive = ({ scanData }: ResultsInteractiveProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);

  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setActions(scanData?.recommendation || []);
  }, [scanData?.id]);

  const handleToggleAction = (id: number) => {
    if (!isHydrated) return;
    setActions(actions.map((action) =>
    action.id === id ? { ...action, completed: !action.completed } : action
    ));
  };

  const [hoverRating, setHoverRating] = useState(0);

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const submitFeedback = async (rating: number) => {
    console.log('🚀 submitFeedback called with rating:', { scanId: scanData?.id, rating });
    if (feedbackSubmitted || isSubmittingFeedback || !scanData?.id) {
        console.warn('⚠️ Feedback submission blocked:', { feedbackSubmitted, isSubmittingFeedback, hasId: !!scanData?.id });
        return;
    }
    
    setIsSubmittingFeedback(true);
    const success = await submitFeedbackToAPI(String(scanData.id), undefined, rating);
    
    if (success) {
        setFeedbackSubmitted(true);
    } else {
        setIsSubmittingFeedback(false);
    }
  };

  // Dynamic Red Flags from API
  const dynamicRedFlags: RedFlag[] = scanData?.reasons?.map((reason, index) => {
      let category = 'Security Threat';
      if (reason.includes('link') || reason.includes('URL') || reason.includes('domain')) category = 'Link Fraud';
      if (reason.includes('brand') || reason.includes('typo')) category = 'Impersonation';
      if (reason.includes('shortener')) category = 'Obfuscation';
      if (reason.includes('financial') || reason.includes('fee')) category = 'Financial risk';
      
      return {
          id: index + 1,
          category,
          description: reason,
          severity: 'high' as const
      };
  }) || [];
  
  const displayFlags = dynamicRedFlags.length > 0 ? dynamicRedFlags : (scanData?.result === 'safe' ? [] : [
      {
          id: 1,
          category: 'Potential Risk',
          description: 'This content triggered our fraud detection algorithms.',
          severity: 'medium' as const
      }
  ]);

  const isSafe = scanData?.result === 'safe';
  const isDocument = (scanData as any)?.scanType === 'document' || !!scanData?.scanMeta;
  const isCompany = scanData?.scanType === 'company';
  
  const getSignalScore = (key: string, mockDefault: number) => {
    const signalValue = (scanData?.signals as any)?.[key] || 0;
    if (signalValue > 0) return Math.min(Math.round(signalValue * 40 + 30), 100); 
    return isSafe ? 5 : mockDefault;
  };

  const mockThreatCategories: ThreatCategory[] = [
  {
    name: 'Financial Fraud Risk',
    score: getSignalScore('financial', 85),
    description: isSafe ? 'Low probability of financial loss' : 'High probability of monetary loss through upfront fees or fake payment schemes',
    icon: 'CurrencyRupeeIcon'
  },
  {
    name: 'Identity Theft Risk',
    score: getSignalScore('impersonation', 72),
    description: isSafe ? 'No sensitive data request detected' : 'Potential misuse of personal documents and sensitive information',
    icon: 'IdentificationIcon'
  },
  {
    name: 'Phishing Attempt',
    score: getSignalScore('links', 68),
    description: isSafe ? 'No suspicious links found' : 'Suspicious links and requests for credentials indicate phishing activity',
    icon: 'ShieldExclamationIcon'
  },
  {
    name: 'Domain Deception',
    score: getSignalScore('typosquatting', 80),
    description: isSafe ? 'Verified domain structure' : 'Detected subtle character variations in major brands (Typosquatting)',
    icon: 'LinkIcon'
  },
  {
    name: 'Urgency & Pressure',
    score: getSignalScore('urgency', 60),
    description: isSafe ? 'Normal communication pace' : 'Language demanding immediate action to prevent negative outcomes',
    icon: 'BoltIcon'
  }];

  const mockPremiumFeatures: Feature[] = [
  { name: 'Unlimited Scans', icon: 'InfinityIcon' },
  { name: 'Detailed PDF Reports', icon: 'DocumentTextIcon' },
  { name: 'Priority Support', icon: 'ChatBubbleLeftRightIcon' },
  { name: 'Advanced Analytics', icon: 'ChartBarSquareIcon' },
  { name: 'Real-time Alerts', icon: 'BellAlertIcon' },
  { name: 'Company Verification', icon: 'BuildingOfficeIcon' }];

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-muted rounded-lg" />
              <div className="h-64 bg-muted rounded-lg" />
              <div className="h-48 bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header with Target */}
      <div className="mb-2">
         <h2 className="text-xl font-headline font-bold text-foreground truncate">
            {scanData?.target ? `Analysis for: "${scanData.target}"` : 'Scan Analysis Results'}
         </h2>
         {scanData?.date && <p className="text-sm text-muted-foreground">{scanData.date}</p>}
      </div>


      {/* Verdict Badge */}
      <VerdictBadge 
        verdict={scanData?.result || "scam"} 
        score={scanData?.confidence || 87} 
        type={(scanData as any)?.scanType === 'document' || scanData?.scanMeta ? 'document' : 'text'}
        customLabel={scanData?.scanMeta?.verdictLabel}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {isDocument && (
            <div className="border-2 border-primary/20 rounded-2xl p-1 bg-primary/5">
                <div className="px-5 py-3 border-b border-primary/10 flex items-center gap-2">
                    <Icon name="DocumentMagnifyingGlassIcon" size={20} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Document-Specific Analysis</h3>
                </div>
                <div className="p-4 space-y-6">
                    {scanData?.scanMeta && <ScanMetaCard meta={scanData.scanMeta} />}
                    <div className="bg-background/50 rounded-xl p-4 border border-primary/10">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                            <Icon name="DocumentTextIcon" size={14} />
                            Extraction Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Source Method</span>
                                <span className="font-semibold text-foreground">{scanData?.scanMeta?.source || 'Neural OCR'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Characters Extracted</span>
                                <span className="font-semibold text-foreground">{scanData?.scanMeta?.textLength || 0} chars</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {!isDocument && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Icon name="ChatBubbleLeftRightIcon" size={18} />
                    Message Analysis
                 </h3>
                 <p className="text-foreground leading-relaxed">
                    {scanData?.target || "No content provided for textual analysis."}
                 </p>
            </div>
          )}

          
          {/* Company Verification Result - Replaces Red Flags/Threats for "company" scan */}
          {(isCompany || (scanData?.metadata?.detectedEntities && scanData.metadata.detectedEntities.length > 0)) && (
            <BusinessVerificationCard 
                entities={scanData?.metadata?.detectedEntities || []} 
                scanType={scanData?.scanType || (isCompany ? 'company' : 'text')}
                target={scanData?.target}
            />
          )}

          {!isCompany && (
            <>
                <GreenFlagsList flags={scanData?.flags?.green || []} />
                <RedFlagsList flags={displayFlags} />
                
                {scanData?.metadata?.detectedLinks && scanData.metadata.detectedLinks.length > 0 && (
                    <LinkAnalysisCard detectedLinks={scanData.metadata.detectedLinks} />
                )}

                <ThreatAnalysis categories={mockThreatCategories} />
            </>
          )}
          <RecommendedActions actions={actions} onToggleAction={handleToggleAction} />
        </div>

        {/* Right Column - Actions & Upgrades */}
        <div className="space-y-6">
          {/* User Feedback Loop */}
          <div className="bg-card rounded-xl shadow-brand p-6 border border-border">
            <h3 className="font-headline font-semibold text-foreground mb-2">How accurate was this result?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your rating directly trains our security model for better accuracy.
            </p>
            
            {!feedbackSubmitted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => submitFeedback(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={isSubmittingFeedback}
                      className={`p-1 transition-all duration-200 ${isSubmittingFeedback ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    >
                      <Icon 
                        name="StarIcon" 
                        size={32} 
                        variant={(hoverRating || 0) >= star ? "solid" : "outline"}
                        className={`${(hoverRating || 0) >= star ? "text-amber-400" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
                <div className="flex justify-between w-full px-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  <span>Inaccurate</span>
                  <span>Perfect</span>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center p-2 bg-success/10 rounded-full mb-2">
                  <Icon name="CheckCircleIcon" size={24} className="text-success" />
                </div>
                <p className="text-sm font-semibold text-success">Thanks! Feedback recorded for training.</p>
              </div>
            )}
          </div>

          <ShareResults 
            scanId={String(scanData?.id || "SCN-2026-001234")} 
            verdict={(scanData?.result || "SCAM").toUpperCase()} 
          />
          <DownloadReport 
            isPremium={false} 
            scanId={String(scanData?.id || "SCN-2026-001234")} 
          />
          <UpgradePrompt features={mockPremiumFeatures} />
        </div>
      </div>
    </div>);

};

/**
 * Feedback Submission Logic
 */
async function submitFeedbackToAPI(scanId: string, feedback?: string, rating?: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId, feedback, rating }),
    });
    return response.ok;
  } catch (err) {
    console.error('Failed to submit feedback:', err);
    return false;
  }
}

export default ResultsInteractive;