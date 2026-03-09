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
import ProphetInsightCard from './ProphetInsightCard';
import DeepScanReportCard from './DeepScanReportCard'; // Premium UI
import { DatabaseHitCard } from './DatabaseHitCard';
import TrustScanReportCard from './TrustScanReportCard';
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
    result: 'safe' | 'risky' | 'scam' | 'fraud' | 'suspicious' | 'action_required';
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
        pagesAnalyzed?: number;
        totalPages?: number;
    };
    metadata?: {
      linkCount?: number;
      detectedLinks?: Array<{
        url: string;
        host: string;
        flags: string[];
      }>;
      detectedEntities?: Array<{
        type: string;
        value: string;
        isValid: boolean;
        portalUrl: string;
        label: string;
      }>;
      databaseHits?: Array<{
        name: string;
        category: 'red_flag' | 'grey_list';
        type: string;
        addedAt?: string;
      }>;
    };
    recommendation?: Action[];
    riskScore?: number;
    trustScanReport?: {
      recommendation: string;
      color: 'red' | 'yellow' | 'green';
      why: string[];
      intent: string;
      advice: string;
    };
    userRating?: number;
    userFeedback?: string | null;
    aiInsight?: string;
    aiModel?: string;
  };

  showFeedback?: boolean;
}

const ResultsInteractive = ({ scanData, showFeedback = true }: ResultsInteractiveProps) => {
  const [internalScanData, setInternalScanData] = useState<any>(scanData || null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
    
    // Load from localStorage if no prop provided (Dashboard Case)
    if (!scanData) {
        const saved = localStorage.getItem('latestScan');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Map apiResult if it exists, otherwise use the object itself
                setInternalScanData(parsed.apiResult || parsed);
            } catch (e) {
                console.error("Failed to parse latest scan", e);
            }
        }
    } else {
        // Fix: If scanData is the wrapper object from ScanInterface, extract the result
        const normalizedData = (scanData as any).apiResult || scanData;
        setInternalScanData(normalizedData);
    }
  }, [scanData]);

  // 💡 ROBUST UNWRAPPER: Try to find the result object whether it is wrapped in apiResult or not
  const getUnwrappedData = (data: any) => {
      if (!data) return null;
      // If it has apiResult, that's our real data
      if (data.apiResult) return data.apiResult;
      // If it has riskScore, it's already unwrapped
      if (data.riskScore !== undefined || data.status) return data;
      // If it doesn't have id/risk/status/apiResult, it might be the wrong object, but let's fallback
      return data;
  };

  const activeScanData = getUnwrappedData(internalScanData || scanData);
  const risk = activeScanData?.riskScore !== undefined ? activeScanData.riskScore : (Number(activeScanData?.confidence) || 50);
  const finalResult = activeScanData?.result || activeScanData?.status || (risk < 35 ? "safe" : "scam");
  const isSafe = finalResult === 'safe' || risk < 35;


  useEffect(() => {
    // Check if feedback was already given
    if (activeScanData?.userRating || activeScanData?.userFeedback) {
        setFeedbackSubmitted(true);
        if (activeScanData.userRating) setHoverRating(activeScanData.userRating);
    } else {
        setFeedbackSubmitted(false);
        setHoverRating(0);
    }

    if (activeScanData?.recommendation && activeScanData.recommendation.length > 0) {
      setActions(activeScanData.recommendation);
    } else if (activeScanData?.reasons && activeScanData.reasons.length > 0) {
      setActions(generateFallbackActions(activeScanData.reasons));
    } else {
      setActions([]);
    }
  }, [activeScanData?.id, activeScanData?.reasons, activeScanData?.riskScore]);

  const handleToggleAction = (id: number) => {
    if (!isHydrated) return;
    setActions(actions.map((action) =>
    action.id === id ? { ...action, completed: !action.completed } : action
    ));
  };

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
      const lowReason = reason.toLowerCase();
      
      if (lowReason.includes('link') || lowReason.includes('url') || lowReason.includes('domain')) category = 'Link Fraud';
      else if (lowReason.includes('brand') || lowReason.includes('typo') || lowReason.includes('impersonation')) category = 'Impersonation';
      else if (lowReason.includes('shortener')) category = 'Obfuscation';
      else if (lowReason.includes('financial') || lowReason.includes('fee') || lowReason.includes('payment')) category = 'Financial Risk';
      else if (lowReason.includes('cin') || lowReason.includes('gst') || lowReason.includes('identity')) category = 'Identity Fraud';
      else if (lowReason.includes('behavioral') || lowReason.includes('urgency') || lowReason.includes('pressure')) category = 'Behavioral Threat';
      else if (lowReason.includes('network alert') || lowReason.includes('trust cascade')) category = 'Database Hit';
      else if (lowReason.includes('business model') || lowReason.includes('verification note')) category = 'Trust Warning';
      
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

  const isDocument = (activeScanData as any)?.scanType === 'document' || !!activeScanData?.scanMeta;
  const isLink = (activeScanData as any)?.scanType === 'link' || (!!activeScanData?.metadata?.detectedLinks && activeScanData.metadata.detectedLinks.length > 0);
  const isCompany = activeScanData?.scanType === 'company';
  
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

  // Safety check for empty or failed scan data (Moved here to avoid Hook Violation)
  if (!scanData || Object.keys(scanData).length === 0) {
      return (
          <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
              <Icon name="ExclamationTriangleIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground">No Result Data Available</h3>
              <p className="text-muted-foreground">The scan could not be completed or returned empty results.</p>
          </div>
      );
  }

  console.log('📦 [ResultsInteractive] Rendering. Keys in activeScanData:', Object.keys(activeScanData || {}).join(', '));
  console.log('🤖 AI INSIGHT CHECK:', !!activeScanData?.aiInsight);

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header with Target */}
      <div className="mb-2">
         <h2 className="text-xl font-headline font-bold text-foreground truncate">
            {activeScanData?.target ? `Analysis for: "${activeScanData.target}"` : 'Scan Analysis Results'}
         </h2>
         {activeScanData?.date && <p className="text-sm text-muted-foreground">{activeScanData.date}</p>}
      </div>

      {/* 🚀 Verdict Badge (Result at Top) */}
      <VerdictBadge 
        verdict={
            activeScanData?.metadata?.databaseHits?.some((h: any) => h.category === 'red_flag') 
                ? 'blacklisted' 
                : activeScanData?.metadata?.databaseHits?.some((h: any) => h.category === 'grey_list') 
                    ? 'greylisted' 
                    : finalResult as any
        } 
        score={activeScanData?.riskScore !== undefined ? activeScanData.riskScore : Number(activeScanData?.confidence) || 87} 
        type={activeScanData?.scanType === 'link' ? 'link' : ((activeScanData as any)?.scanType === 'document' || activeScanData?.scanMeta ? 'document' : 'text')}
        customLabel={activeScanData?.scanMeta?.verdictLabel}
      />

      {/* 🔮 Deep Search result (Prophet AI Insight / Deep Scan Report) */}
      {activeScanData?.scanMeta?.deepScanReport ? (
          <DeepScanReportCard deepScanReport={activeScanData.scanMeta.deepScanReport} />
      ) : (
          <ProphetInsightCard 
            insight={activeScanData?.aiInsight || ""} 
            modelUsed={activeScanData?.aiModel} 
          />
      )}

      {/* Human Readable Report (Simple Guide) */}
      <TrustScanReportCard report={activeScanData?.trustScanReport} />

      {/* Red Flag Warning Banner */}
      {!isSafe && displayFlags.length > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-4 animate-fade-in">
              <Icon name="ExclamationTriangleIcon" size={24} className="text-warning mt-0.5 flex-shrink-0" />
              <div>
                  <h3 className="font-bold text-warning-foreground text-base mb-1">
                      {displayFlags.length} Red Flag{displayFlags.length !== 1 ? 's' : ''} Detected
                  </h3>
                  <p className="text-sm text-foreground/80">
                      Our analysis found potential threats in this document. Please follow the <a href="#recommended-actions" className="font-bold underline hover:text-warning transition-colors">Recommended Actions</a> below to ensure your safety.
                  </p>
              </div>
          </div>
      )}

      {/* Partial Analysis Warning */}
      {isDocument && activeScanData?.scanMeta && (activeScanData.scanMeta.totalPages || 0) > (activeScanData.scanMeta.pagesAnalyzed || 0) && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-4 animate-fade-in mb-6">
              <Icon name="InformationCircleIcon" size={24} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                  <h3 className="font-bold text-blue-500 text-base mb-1">
                      Partial Document Analysis
                  </h3>
                  <p className="text-sm text-foreground/80">
                      Standard scan analyzed the first <strong>{activeScanData.scanMeta.pagesAnalyzed}</strong> pages of this {activeScanData.scanMeta.totalPages}-page document. For full multi-page verification, please upgrade to Premium.
                  </p>
              </div>
          </div>
      )}

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
                    {activeScanData?.scanMeta && <ScanMetaCard meta={activeScanData.scanMeta} />}
                    <div className="bg-background/50 rounded-xl p-4 border border-primary/10">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                            <Icon name="DocumentTextIcon" size={14} />
                            Extraction Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Source Method</span>
                                <span className="font-semibold text-foreground">{activeScanData?.scanMeta?.source || 'Neural OCR'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Characters Extracted</span>
                                <span className="font-semibold text-foreground">{activeScanData?.scanMeta?.textLength || 0} chars</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {isLink && activeScanData?.metadata?.detectedLinks && activeScanData.metadata.detectedLinks.length > 0 && (
             <div className="border-t-4 border-sky-500 rounded-2xl overflow-hidden shadow-brand-lg transition-all hover:shadow-sky-500/10">
                <LinkAnalysisCard detectedLinks={activeScanData.metadata.detectedLinks} />
             </div>
          )}

          {!isDocument && !isLink && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Icon name="ChatBubbleLeftRightIcon" size={18} />
                    Message Analysis
                 </h3>
                 <p className="text-foreground leading-relaxed">
                    {activeScanData?.target || "No content provided for textual analysis."}
                 </p>
            </div>
          )}

          
          {/* Intelligence Database Hits (Red/Grey List) */}
          {activeScanData?.metadata?.databaseHits && activeScanData.metadata.databaseHits.length > 0 && (
            <DatabaseHitCard hits={activeScanData.metadata.databaseHits} />
          )}

          {/* Company Verification Result - Replaces Red Flags/Threats for "company" scan */}
          {(isCompany || (activeScanData?.metadata?.detectedEntities && activeScanData.metadata.detectedEntities.length > 0)) && (
            <BusinessVerificationCard 
                entities={activeScanData?.metadata?.detectedEntities || []} 
                scanType={activeScanData?.scanType || (isCompany ? 'company' : 'text')}
                target={activeScanData?.target}
            />
          )}

          {!isCompany && (
            <>
                <GreenFlagsList flags={activeScanData?.flags?.green || []} />
                <RedFlagsList flags={displayFlags} />
                
                {/* <ThreatAnalysis categories={mockThreatCategories} /> */}
            </>
          )}
         </div>

        {/* Right Column - Actions & Upgrades */}
        <div className="space-y-6">
          {/* User Feedback Loop */}
          {showFeedback !== false && (
            <div className="bg-card rounded-xl shadow-brand p-6 border border-border">
                <h3 className="font-headline font-semibold text-foreground mb-2">How accurate was this result?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                Your rating directly trains our security model for better accuracy.
                </p>
                
                {!feedbackSubmitted ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button
                        key={starIdx}
                        onClick={() => submitFeedback(starIdx)}
                        onMouseEnter={() => setHoverRating(starIdx)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={isSubmittingFeedback}
                        className={`p-1 transition-all duration-200 ${isSubmittingFeedback ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                        >
                        <Icon 
                            name="StarIcon" 
                            size={32} 
                            variant={(hoverRating || 0) >= starIdx ? "solid" : "outline"}
                            className={`${(hoverRating || 0) >= starIdx ? "text-amber-400" : "text-muted-foreground"}`}
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
          )}

          <ShareResults 
            scanId={String(activeScanData?.id || "SCN-2026-001234")} 
            verdict={(activeScanData?.result || "SCAM").toUpperCase()} 
          />
          <DownloadReport 
            isPremium={false} 
            scanId={String(activeScanData?.id || "SCN-2026-001234")} 
          />
          <UpgradePrompt features={mockPremiumFeatures} />
          
          {!isCompany && actions.length > 0 && (
             <div id="recommended-actions" className="scroll-mt-24 animate-fade-in">
                <RecommendedActions actions={actions} onToggleAction={handleToggleAction} />
             </div>
          )}
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


const generateFallbackActions = (reasons: string[]): Action[] => {
  const actions: Action[] = [];
  const text = reasons.join(' ').toLowerCase();

  // Job Scam Logic
  if (text.includes('unsolicited') || text.includes('job offer') || text.includes('salary') || text.includes('internship')) {
    actions.push({
      id: 901,
      title: 'Verify Employer Identity',
      description: 'Do not pay any upfront fees. Legitimate employers never ask for money for training, equipment, or visa fees. Verify the offer independently.',
      priority: 'critical',
      completed: false
    });
    
    actions.push({
      id: 902,
      title: 'Check Official Channels',
      description: 'Visit the company\'s official website career page to verify if this job opening exists.',
      priority: 'important',
      completed: false
    });
  }

  // Business ID Logic
  if (text.includes('missing official business id') || text.includes('cin') || text.includes('gst')) {
    actions.push({
      id: 903,
      title: 'Request Business Registration',
      description: 'Ask the recruiter for their Corporate Identity Number (CIN) or GST to verify legitimacy.',
      priority: 'critical',
      completed: false
    });
    
    actions.push({
      id: 904,
      title: 'Verify with Ministry of Corporate Affairs',
      description: 'Search for the company name on the official MCA portal to check if it is a registered entity.',
      priority: 'recommended',
      completed: false
    });
  }
  
  // Generic Link Warnings
  if (text.includes('link') || text.includes('url') || text.includes('phishing')) {
      actions.push({
          id: 905,
          title: 'Do Not Click Suspicious Links',
          description: 'Links in this document may lead to phishing sites. Verify them manually before clicking.',
          priority: 'critical',
          completed: false
      });
  }
  
  // Fallback if we have red flags but matched no specific logic
  if (actions.length === 0 && reasons.length > 0) {
      actions.push({
          id: 906,
          title: 'Exercise Extreme Caution',
          description: 'This document contains detected red flags. Do not share sensitive personal information or make payments.',
          priority: 'critical',
          completed: false
      });
  }

  return actions;
};

export default ResultsInteractive;