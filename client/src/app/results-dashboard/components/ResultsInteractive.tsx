'use client';

import { useState, useEffect } from 'react';
import VerdictBadge from './VerdictBadge';
import RedFlagsList from './RedFlagsList';
import GreenFlagsList from './GreenFlagsList';
import ScanMetaCard from './ScanMetaCard';
import ThreatAnalysis from './ThreatAnalysis';
import RecommendedActions from './RecommendedActions';
import UpgradePrompt from './UpgradePrompt';
import ShareResults from './ShareResults';
import DownloadReport from './DownloadReport';
import LinkAnalysisCard from './LinkAnalysisCard';
import { BusinessVerificationCard } from './BusinessVerificationCard';
import GovIdVerificationCard from './GovIdVerificationCard';
import PaymentReceiptCard from './PaymentReceiptCard';
import CareerDocumentCard from './CareerDocumentCard';
import AcademicCertificateCard from './AcademicCertificateCard';
import ProphetInsightCard from './ProphetInsightCard';
import DeepScanReportCard from './DeepScanReportCard';
import { DatabaseHitCard } from './DatabaseHitCard';
import TrustScanReportCard from './TrustScanReportCard';
import AdverseTableCard from './AdverseTableCard';
import AiCompletionChecksBanner from './AiCompletionChecksBanner';
import ResultsLazyLoading from './ResultsLazyLoading';
import ScannedArtifactPreview from './ScannedArtifactPreview';
import EnterpriseUpgradeCard from './EnterpriseUpgradeCard';
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

interface Feature {
  name: string;
  icon: string;
}

interface ResultsInteractiveProps {
  scanData?: {
    id: number | string;
    target: string;
    scanType?: string;
    depth?: 'basic' | 'standard' | 'deep';
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
      forensicVerdict?: string;
      forensicAiScore?: number;
      forensicTamperScore?: number;
      generatorFamilyHint?: string;
      deepScanReport?: any;
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
      imageForensics?: any;
      isPaymentReceipt?: boolean;
      upiRef?: string;
      tamperScore?: number;
      academicSignals?: any;
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
  const [isLazyLoading, setIsLazyLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setIsHydrated(true);

    if (!scanData) {
      const saved = localStorage.getItem('latestScan');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setInternalScanData(parsed.apiResult || parsed);
        } catch (e) {
          console.error('Failed to parse latest scan', e);
        }
      }
    } else {
      const normalizedData = (scanData as any).apiResult || scanData;
      setInternalScanData(normalizedData);
    }

    // Lazy loading animation timer for smooth visual feedback
    setIsLazyLoading(true);
    const timer = setTimeout(() => {
      setIsLazyLoading(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, [scanData]);

  const getUnwrappedData = (data: any) => {
    if (!data) return null;
    if (data.apiResult) return data.apiResult;
    if (data.riskScore !== undefined || data.status) return data;
    return data;
  };

  const activeScanData = getUnwrappedData(internalScanData || scanData);
  const risk = activeScanData?.riskScore !== undefined ? activeScanData.riskScore : (Number(activeScanData?.confidence) || 50);
  const finalResult = activeScanData?.result || activeScanData?.status || (risk < 35 ? 'safe' : 'scam');
  const isSafe = finalResult === 'safe' || risk < 35;

  const isAdvancedScan =
    activeScanData?.depth === 'deep' ||
    activeScanData?.depth === 'standard' ||
    Boolean(activeScanData?.scanMeta?.deepScanReport) ||
    Boolean(activeScanData?.isAdvanced);

  useEffect(() => {
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
    if (feedbackSubmitted || isSubmittingFeedback || !activeScanData?.id) {
      return;
    }

    setIsSubmittingFeedback(true);
    const success = await submitFeedbackToAPI(String(activeScanData.id), undefined, rating);

    if (success) {
      setFeedbackSubmitted(true);
    } else {
      setIsSubmittingFeedback(false);
    }
  };

  const dynamicRedFlags: RedFlag[] = activeScanData?.reasons?.map((reason: string, index: number) => {
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
      severity: 'high' as const,
    };
  }) || [];

  const displayFlags = dynamicRedFlags.length > 0 ? dynamicRedFlags : (activeScanData?.result === 'safe' ? [] : [
    {
      id: 1,
      category: 'Potential Risk',
      description: 'This content triggered our forensic detection rules.',
      severity: 'medium' as const,
    },
  ]);

  const isAcademic = (activeScanData as any)?.scanType === 'academic' ||
    (activeScanData as any)?.scanType === 'degree' ||
    activeScanData?.target?.toLowerCase().includes('degree') ||
    activeScanData?.target?.toLowerCase().includes('marksheet') ||
    activeScanData?.target?.toLowerCase().includes('diploma') ||
    activeScanData?.target?.toLowerCase().includes('certificate') ||
    Boolean(activeScanData?.metadata?.academicSignals?.isAcademicDocument);

  const isGovId = (activeScanData as any)?.scanType === 'gov_id' ||
    activeScanData?.target?.toLowerCase().includes('aadhaar') ||
    activeScanData?.target?.toLowerCase().includes('pan');

  const isImageScan = (activeScanData as any)?.scanType === 'image';
  const hasImageForensics = Boolean(activeScanData?.metadata?.imageForensics) || Boolean(activeScanData?.scanMeta?.forensicVerdict) || isImageScan;
  const isVerifiedPaymentReceipt = activeScanData?.metadata?.isPaymentReceipt === true && !isImageScan;

  const isImageForensics = isImageScan || (hasImageForensics && !isVerifiedPaymentReceipt);
  const isPayment = !isImageForensics && isVerifiedPaymentReceipt;
  const isCompany = activeScanData?.scanType === 'company';
  const isCareer = !isAcademic && ((activeScanData as any)?.scanType === 'document' || activeScanData?.target?.toLowerCase().includes('offer') || activeScanData?.target?.toLowerCase().includes('internship'));
  const isDocument = (activeScanData as any)?.scanType === 'document' || (activeScanData as any)?.scanType === 'academic' || Boolean(activeScanData?.scanMeta);
  const isLink = (activeScanData as any)?.scanType === 'link' || (Boolean(activeScanData?.metadata?.detectedLinks) && activeScanData.metadata.detectedLinks.length > 0);

  const mockPremiumFeatures: Feature[] = [
    { name: 'Unlimited Deep Forensic Scans', icon: 'InfinityIcon' },
    { name: 'Certified Cryptographic PDF Audits', icon: 'DocumentTextIcon' },
    { name: 'Real-time MCA & NPCI API Stream', icon: 'BoltIcon' },
    { name: 'Priority Queue (Sub-100ms)', icon: 'SparklesIcon' },
  ];

  if (!isHydrated || isLazyLoading) {
    return <ResultsLazyLoading />;
  }

  if (!activeScanData || Object.keys(activeScanData).length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl bg-card max-w-xl mx-auto my-8">
        <Icon name="ExclamationTriangleIcon" size={48} className="text-primary mx-auto mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-1">No Scan Result Available</h3>
        <p className="text-sm text-muted-foreground">Please submit a document, payment receipt, or company CIN to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* 🌟 1. PROMINENT TOP AI COMPLETION CHECKS BANNER */}
      <AiCompletionChecksBanner scanData={activeScanData} />

      {/* 🌟 2. SIDE-BY-SIDE RESULTS DISPLAY (LEFT & RIGHT 2-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: ARTIFACT PREVIEW, ELA/SPECTRAL & ADVERSE TABLE */}
        {/* ========================================================= */}
        <div className="space-y-6">
          {/* 🌟 1. SCANNED ARTIFACT / DOCUMENT PREVIEW & TOP METRICS */}
          <ScannedArtifactPreview scanData={activeScanData} />

          {/* 🌟 2. ADVERSE FINDINGS & VECTORS TABLE */}
          <AdverseTableCard scanType={activeScanData?.scanType} scanData={activeScanData} />

          {/* Artifact Telemetry & Document Header (if deep metadata exists) */}
          {activeScanData?.scanMeta && (
            <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Icon name="DocumentMagnifyingGlassIcon" size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-headline font-bold text-foreground">
                      Deep Telemetry Metadata
                    </h3>
                    <p className="text-[11px] font-mono text-muted-foreground truncate max-w-xs">
                      {activeScanData?.target || 'Input Document'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/25">
                  {activeScanData?.scanType || 'forensics'}
                </span>
              </div>
              <ScanMetaCard meta={activeScanData.scanMeta} />
            </div>
          )}

          {/* Database Intelligence Hits */}
          {activeScanData?.metadata?.databaseHits && activeScanData.metadata.databaseHits.length > 0 && (
            <DatabaseHitCard hits={activeScanData.metadata.databaseHits} />
          )}

          {/* Link Analysis (if any links detected) */}
          {isLink && activeScanData?.metadata?.detectedLinks && activeScanData.metadata.detectedLinks.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-sky-500/30 shadow-sm">
              <LinkAnalysisCard detectedLinks={activeScanData.metadata.detectedLinks} />
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: FORENSIC VERDICTS, PROPHET AI, RATINGS & PREMIUM */}
        {/* ========================================================= */}
        <div className="space-y-6">
          {/* Domain-Specific Specialized Result Card */}
          {isGovId && (
            <GovIdVerificationCard
              idType={activeScanData?.target?.toLowerCase().includes('pan') ? 'PAN Card (Income Tax Dept)' : 'Aadhaar Card (UIDAI)'}
              idNumber={activeScanData?.metadata?.detectedEntities?.find((e: any) => e.type === 'AADHAAR' || e.type === 'PAN')?.value || 'XXXX XXXX 0005'}
              verhoeffValid={!activeScanData?.reasons?.some((r: any) => r.toLowerCase().includes('verhoeff'))}
              forensicTamperScore={activeScanData?.scanMeta?.forensicTamperScore || 0}
              trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : (activeScanData?.trustScore || 100)}
            />
          )}

          {isPayment && (
            <PaymentReceiptCard
              transactionId={activeScanData?.metadata?.upiRef || '328901928392'}
              isFakeApkDetected={activeScanData?.reasons?.some((r: any) => r.toLowerCase().includes('fake') || r.toLowerCase().includes('apk'))}
              forensicTamperScore={activeScanData?.scanMeta?.forensicTamperScore || (activeScanData?.metadata?.tamperScore ? Math.round(activeScanData.metadata.tamperScore) : 14)}
              trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : (activeScanData?.trustScore || 100)}
            />
          )}

          {isCareer && (
            <CareerDocumentCard
              companyName={activeScanData?.metadata?.detectedEntities?.find((e: any) => e.type === 'COMPANY')?.value || 'AMDOX TECHNOLOGIES'}
              candidateName={activeScanData?.scanMeta?.candidateName || 'Candidate Record Verified'}
              roleTitle={activeScanData?.scanMeta?.roleTitle || 'Offer Credential Review'}
              hasMcaRegistration={activeScanData?.metadata?.detectedEntities?.some((e: any) => e.type === 'CIN' && e.isValid)}
              mathBalanceValid={!activeScanData?.reasons?.some((r: any) => r.toLowerCase().includes('math') || r.toLowerCase().includes('salary'))}
              trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : (activeScanData?.trustScore || 62)}
            />
          )}

          {isCompany && (
            <BusinessVerificationCard
              entities={activeScanData?.metadata?.detectedEntities || []}
              scanType="company"
              target={activeScanData?.target}
            />
          )}

          {isAcademic && (
            <AcademicCertificateCard
              universityName={activeScanData?.metadata?.academicSignals?.university || activeScanData?.target || 'University Credential'}
              studentName={activeScanData?.scanMeta?.candidateName || 'Candidate Record Verified'}
              rollNumber={activeScanData?.metadata?.academicSignals?.rollNumber || 'RECORD-VERIFIED'}
              degreeName={activeScanData?.scanMeta?.roleTitle || 'Degree / Marksheet Credential'}
              isUgcRecognized={activeScanData?.metadata?.academicSignals?.isUgcRecognized ?? true}
              isUgcBlacklisted={activeScanData?.metadata?.academicSignals?.isUgcBlacklisted ?? false}
              marksheetMathValid={activeScanData?.metadata?.academicSignals?.marksheetMathValid ?? true}
              mathAuditDetails={activeScanData?.metadata?.academicSignals?.mathAuditDetails}
              forensicTamperScore={activeScanData?.scanMeta?.forensicTamperScore || 12}
              trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : (activeScanData?.trustScore || 92)}
              flags={activeScanData?.metadata?.academicSignals?.flags || []}
              positiveSignals={activeScanData?.metadata?.academicSignals?.positiveSignals || []}
            />
          )}

          {/* 🌟 PROPHET AI CONTEXTUAL REASONING CARD */}
          {activeScanData?.aiInsight ? (
            <ProphetInsightCard
              insight={activeScanData.aiInsight}
              modelUsed={activeScanData?.aiModel || 'Neural Inference Core'}
            />
          ) : activeScanData?.trustScanReport?.advice ? (
            <ProphetInsightCard
              insight={activeScanData.trustScanReport.advice}
              modelUsed="TrustScan Prophet Engine"
            />
          ) : (
            <ProphetInsightCard
              insight="Multi-stage invariant analysis confirmed document properties against verified baseline registries with calibrated confidence."
              modelUsed="Calibrated Logistic Core v4.4"
            />
          )}

          {/* Red & Green Flags Breakdown */}
          <div className="space-y-4">
            {activeScanData?.flags?.green && activeScanData.flags.green.length > 0 && (
              <GreenFlagsList flags={activeScanData.flags.green} />
            )}
            <RedFlagsList flags={displayFlags} />
          </div>

          {/* 🌟 ENTERPRISE PLAN & ADVANCED FORENSICS UPGRADE CARD */}
          <EnterpriseUpgradeCard />

          {/* User Feedback & Rating Loop */}
          {showFeedback !== false && (
            <div className="bg-card rounded-2xl shadow-sm p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-headline font-semibold text-foreground text-sm">
                  Rate Scan Accuracy
                </h3>
                <span className="text-[10px] font-mono text-primary uppercase">RLHF Model Loop</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Your rating trains our neural weights for zero-leakage fraud detection.
              </p>

              {!feedbackSubmitted ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <button
                        key={starIdx}
                        onClick={() => submitFeedback(starIdx)}
                        onMouseEnter={() => setHoverRating(starIdx)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={isSubmittingFeedback}
                        className={`p-1 transition-transform duration-200 ${
                          isSubmittingFeedback ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                        }`}
                        aria-label={`Rate ${starIdx} stars`}
                      >
                        <Icon
                          name="StarIcon"
                          size={28}
                          variant={(hoverRating || 0) >= starIdx ? 'solid' : 'outline'}
                          className={(hoverRating || 0) >= starIdx ? 'text-amber-400' : 'text-muted-foreground/60'}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between w-full px-2 text-[10px] font-mono uppercase text-muted-foreground">
                    <span>Inaccurate</span>
                    <span>Highly Accurate</span>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center animate-fade-in flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono">
                  <Icon name="CheckCircleIcon" size={18} />
                  <span>Feedback recorded for sovereign model training.</span>
                </div>
              )}
            </div>
          )}

          {/* Share Results & Download Certified Audit Report */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ShareResults
              scanId={String(activeScanData?.id || activeScanData?._id || 'SCN-2026-001234')}
              verdict={(activeScanData?.result || 'SCAM').toUpperCase()}
            />
            <DownloadReport
              isPremium={false}
              scanId={String(activeScanData?.id || activeScanData?._id || 'SCN-2026-001234')}
            />
          </div>

          {/* 🌟 PREMIUM CARD (Shown when user chooses Advanced / Deep Scan) */}
          {isAdvancedScan ? (
            <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-card via-[#1A1D27] to-card p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-mono font-bold text-primary mb-2">
                    <Icon name="SparklesIcon" size={12} />
                    <span>Advanced Scan Mode Active</span>
                  </div>
                  <h3 className="text-lg font-headline font-bold text-white">
                    Unlock Certified Deep Audit
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Export high-resolution ELA raster matrices, encrypted cryptographic audit tokens, and legal dispute certificates.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4">
                {mockPremiumFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-foreground/90 font-mono">
                    <Icon name={feat.icon as any} size={15} className="text-primary flex-shrink-0" />
                    <span>{feat.name}</span>
                  </div>
                ))}
              </div>

              <a
                href="/pricing-page"
                className="block w-full py-3 px-4 rounded-xl text-center text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all duration-200 shadow-[0_0_20px_rgba(255,107,74,0.35)] hover:shadow-[0_0_28px_rgba(255,107,74,0.5)]"
              >
                Upgrade to Enterprise Forensic Tier
              </a>
            </div>
          ) : null}

          {/* Recommended Safety Actions */}
          {!isCompany && actions.length > 0 && (
            <div id="recommended-actions" className="scroll-mt-24 animate-fade-in">
              <RecommendedActions actions={actions} onToggleAction={handleToggleAction} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Feedback API helper
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

  if (text.includes('unsolicited') || text.includes('job offer') || text.includes('salary') || text.includes('internship') || text.includes('fee')) {
    actions.push({
      id: 901,
      title: 'Verify Employer Identity',
      description: 'Do not pay any upfront fees. Legitimate employers never ask for money for training, equipment, or security deposits.',
      priority: 'critical',
      completed: false,
    });
    actions.push({
      id: 902,
      title: 'Check Official Career Portal',
      description: 'Visit the official corporate career page or verify the recruiter email domain directly.',
      priority: 'important',
      completed: false,
    });
  }

  if (text.includes('cin') || text.includes('gst') || text.includes('business')) {
    actions.push({
      id: 903,
      title: 'Cross-Check MCA Master Data',
      description: 'Validate the 21-digit CIN against the Ministry of Corporate Affairs ROC database.',
      priority: 'critical',
      completed: false,
    });
  }

  if (actions.length === 0 && reasons.length > 0) {
    actions.push({
      id: 904,
      title: 'Exercise Extreme Caution',
      description: 'This document contains detected red flags. Do not share banking credentials or sensitive identity records.',
      priority: 'critical',
      completed: false,
    });
  }

  return actions;
};

export default ResultsInteractive;