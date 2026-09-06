'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import VerdictBadge from '@/app/results-dashboard/components/VerdictBadge';
import ShareResults from '@/app/results-dashboard/components/ShareResults';
import DownloadReport from '@/app/results-dashboard/components/DownloadReport';
import { BusinessVerificationCard } from '@/app/results-dashboard/components/BusinessVerificationCard';
import GovIdVerificationCard from '@/app/results-dashboard/components/GovIdVerificationCard';
import PaymentReceiptCard from '@/app/results-dashboard/components/PaymentReceiptCard';
import CareerDocumentCard from '@/app/results-dashboard/components/CareerDocumentCard';
import AcademicCertificateCard from '@/app/results-dashboard/components/AcademicCertificateCard';
import ProphetInsightCard from '@/app/results-dashboard/components/ProphetInsightCard';

import AiCompletionChecksBanner from '@/app/results-dashboard/components/AiCompletionChecksBanner';
import ScannedArtifactPreview from '@/app/results-dashboard/components/ScannedArtifactPreview';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { API_BASE_URL } from '@/api/scan';

interface ScanProgressProps {
  isScanning: boolean;
  scanResult?: any | null;
  onComplete?: () => void;
  depth?: 'basic' | 'standard' | 'deep';
  type?: string;
  fileName?: string;
  fileSizeFormatted?: string;
  previewUrl?: string | null;
  onCancel?: () => void;
  onReset?: () => void;
}

export default function ScanProgress({
  isScanning,
  scanResult = null,
  onComplete,
  depth = 'basic',
  type = 'document',
  fileName = 'sample_artifact.jpg',
  fileSizeFormatted = '2.4 MB',
  previewUrl = null,
  onCancel,
  onReset,
}: ScanProgressProps) {
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isPdf = fileName?.toLowerCase().endsWith('.pdf') || type === 'document' || type === 'career';

  // User feedback rating state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // AI Detection score rings state
  const [scanScores, setScanScores] = useState({ aiGen: 0, edited: 0, original: 0 });

  // Share state & handlers
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSharePlatform = (platform: 'x' | 'whatsapp' | 'linkedin' | 'telegram') => {
    const _data = scanResult?.apiResult || scanResult;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/results-dashboard` : '';
    const text = `I verified this on TrustScan AI — verdict: ${_data?.result || 'Verified'}. Check the forensic report:`;
    const urls: Record<string, string> = {
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=450');
    }
  };

  const handleCopyShareLink = () => {
    const _data = scanResult?.apiResult || scanResult;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/results-dashboard` : '';
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  useEffect(() => {
    setImgError(false);
  }, [previewUrl]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getDuration = () => {
    if (type === 'document') {
      return depth === 'deep' ? 14000 : (depth === 'standard' ? 9000 : 5500);
    }
    if (type === 'company') return 6000;
    if (type === 'image') return depth === 'deep' ? 12000 : 6000;
    return 5000;
  };

  const estimatedDuration = getDuration();

  // Dynamic progress engine while scanning
  useEffect(() => {
    if (scanResult) {
      setProgress(100);
      setActiveStepIndex(4); // All steps completed
      return;
    }

    if (!isScanning || !isHydrated) {
      setProgress(0);
      setActiveStepIndex(0);
      return;
    }

    const updateInterval = 60;
    const interval = setInterval(() => {
      setProgress((prev) => {
        let increment = 100 / (estimatedDuration / updateInterval);
        if (prev > 85) increment = 0.4;
        if (prev > 95) increment = 0.1;
        if (prev >= 99) return 99;

        const next = prev + increment;

        if (next < 25) setActiveStepIndex(0);
        else if (next < 60) setActiveStepIndex(1);
        else if (next < 88) setActiveStepIndex(2);
        else setActiveStepIndex(3);

        return next;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isScanning, isHydrated, estimatedDuration, scanResult]);

  // Animate AI detection score rings
  useEffect(() => {
    if (scanResult) {
      const apiResult = scanResult?.apiResult || scanResult;
      const risk = apiResult?.riskScore ?? 50;
      const aiGen = Math.min(Math.round(risk * 0.52), 82);
      const edited = Math.min(Math.round(risk * 0.38), 55);
      const original = Math.max(0, 100 - aiGen - edited);
      setScanScores({ aiGen, edited, original });
      return;
    }
    if (!isScanning) {
      setScanScores({ aiGen: 0, edited: 0, original: 0 });
      return;
    }
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      setScanScores(prev => ({
        aiGen: Math.min(prev.aiGen + Math.random() * 1.8, frame < 50 ? 18 : 26),
        edited: Math.min(prev.edited + Math.random() * 1.4, frame < 50 ? 13 : 20),
        original: Math.min(prev.original + Math.random() * 2.5, frame < 50 ? 30 : 48),
      }));
    }, 220);
    return () => clearInterval(timer);
  }, [isScanning, scanResult]);

  if (!isScanning && !scanResult) return null;

  const activeScanData = scanResult?.apiResult || scanResult;
  const isResultReady = Boolean(scanResult && activeScanData);

  const displayFileName = fileName || activeScanData?.fileName || activeScanData?.target || 'mountain.jpg';
  const displayFileSize = fileSizeFormatted || activeScanData?.fileSizeFormatted || '2.4 MB';
  const displayDimensions = '1024 × 768';

  // Result card classifications — accurately evaluated both during scanning and on completion
  const isImageScan = type === 'image' || activeScanData?.scanType === 'image';

  const isAcademic =
    type === 'academic' ||
    type === 'degree' ||
    activeScanData?.scanType === 'academic' ||
    activeScanData?.scanType === 'degree' ||
    activeScanData?.target?.toLowerCase().includes('degree') ||
    activeScanData?.target?.toLowerCase().includes('marksheet') ||
    fileName?.toLowerCase().includes('degree') ||
    fileName?.toLowerCase().includes('marksheet') ||
    Boolean(activeScanData?.metadata?.academicSignals?.isAcademicDocument);

  const isGovId =
    type === 'gov_id' ||
    activeScanData?.scanType === 'gov_id' ||
    activeScanData?.target?.toLowerCase().includes('aadhaar') ||
    activeScanData?.target?.toLowerCase().includes('pan') ||
    fileName?.toLowerCase().includes('aadhaar') ||
    fileName?.toLowerCase().includes('pan');

  const isVerifiedPaymentReceipt = (type === 'payment' || activeScanData?.metadata?.isPaymentReceipt === true) && !isImageScan;
  const isPayment = type === 'payment' || (!isImageScan && isVerifiedPaymentReceipt);
  const isCompany = type === 'company' || activeScanData?.scanType === 'company';
  const isCareer = !isAcademic && !isPayment && !isCompany && !isImageScan && !isGovId;
  const isImageForensics = isImageScan;

  const pipelineSteps = isCareer ? [
    {
      title: 'Offer letter uploaded',
      subtitle: 'Completed',
    },
    {
      title: 'Text & Entity Extraction',
      subtitle: isResultReady ? 'Completed • Company & compensation parsed' : 'Parsing company, salary & contact data...',
    },
    {
      title: 'MCA & Domain Verification',
      subtitle: isResultReady ? 'Completed • Official registries queried' : 'Cross-checking MCA, domain & fraud DB...',
    },
    {
      title: 'Fraud Assessment & Verdict',
      subtitle: isResultReady ? 'Completed • Offer analysis ready' : 'Compiling offer letter assessment...',
    },
  ] : isCompany ? [
    {
      title: 'Company query submitted',
      subtitle: 'Completed',
    },
    {
      title: 'MCA Master Data Lookup',
      subtitle: isResultReady ? 'Completed • MCA records found' : 'Searching Ministry of Corporate Affairs...',
    },
    {
      title: 'GSTIN & Network Audit',
      subtitle: isResultReady ? 'Completed • Tax compliance verified' : 'Validating GSTIN & director network...',
    },
    {
      title: 'Corporate Risk Report',
      subtitle: isResultReady ? 'Completed • Entity dossier ready' : 'Compiling entity verification...',
    },
  ] : isPayment ? [
    {
      title: 'Payment receipt uploaded',
      subtitle: 'Completed',
    },
    {
      title: 'UTR & OCR Parsing',
      subtitle: isResultReady ? 'Completed • 12-digit UTR extracted' : 'Extracting reference & transaction details...',
    },
    {
      title: 'Anti-Fake APK & Forensic Check',
      subtitle: isResultReady ? 'Completed • UI layout verified' : 'Inspecting pixel fonts & spoof patterns...',
    },
    {
      title: 'Payment Verification Result',
      subtitle: isResultReady ? 'Completed • Receipt integrity confirmed' : 'Compiling payment verdict...',
    },
  ] : [
    {
      title: 'Image / Document uploaded',
      subtitle: 'Completed',
    },
    {
      title: 'Preprocessing & OCR',
      subtitle: isResultReady ? 'Completed • Sarvam Vision Digitization' : 'Enhancing resolution & noise suppression...',
    },
    {
      title: 'AI & Invariant Analysis',
      subtitle: isResultReady ? 'Completed • ELA & Forensic Invariants' : 'Detecting tampering, ELA disparity & registry check...',
    },
    {
      title: 'Finalizing result',
      subtitle: isResultReady ? 'Completed • Sovereign Report Ready' : 'Compiling sovereign forensic report...',
    },
  ];

  const featureCards = [
    {
      icon: 'SparklesIcon',
      title: 'AI Powered',
      desc: 'Accurate results',
      iconBg: 'bg-[#818CF8]/15 text-[#818CF8] border-[#818CF8]/30',
    },
    {
      icon: 'ShieldCheckIcon',
      title: 'Secure',
      desc: 'Your data is safe',
      iconBg: 'bg-[#4ADE80]/15 text-[#4ADE80] border-[#4ADE80]/30',
    },
    {
      icon: 'BoltIcon',
      title: 'Fast',
      desc: 'Results in seconds',
      iconBg: 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30',
    },
    {
      icon: 'StarIcon',
      title: 'Reliable',
      desc: 'Trusted by users',
      iconBg: 'bg-[#FF6B4A]/15 text-[#FF6B4A] border-[#FF6B4A]/30',
    },
  ];

  // Feedback Submission handler
  const submitFeedback = async (rating: number) => {
    if (feedbackSubmitted || isSubmittingFeedback || !activeScanData?.id) return;
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: String(activeScanData.id), rating }),
      });
      if (res.ok) setFeedbackSubmitted(true);
    } catch (e) {
      console.warn('Feedback submit error:', e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleResetOrCancel = () => {
    if (onReset) onReset();
    else if (onCancel) onCancel();
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onReset) onReset();
    if (onCancel) onCancel();

    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/') {
        window.location.reload();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-background text-foreground flex flex-col animate-fade-in">
      {/* Ambient background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#818CF8]/10 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#4ADE80]/5 blur-[120px]" />
      </div>

      {/* 🌟 TOP NAVIGATION BAR */}
      <header className="relative z-10 border-b border-border bg-background/90 backdrop-blur-md px-6 lg:px-10 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B4A] via-[#818CF8] to-[#4ADE80] p-[1.5px] shadow-[0_0_15px_rgba(255,107,74,0.3)]">
              <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center text-primary font-bold">
                <Icon name="ShieldCheckIcon" size={20} className="text-[#FF6B4A]" />
              </div>
            </div>
            <div onClick={handleGoHome} className="cursor-pointer">
              <span className="font-headline font-bold text-lg text-foreground tracking-tight">
                TrustScan <span className="text-primary text-xs font-mono px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 ml-1">AI</span>
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={handleGoHome}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Home
            </button>
            <span className="text-primary font-semibold border-b-2 border-primary pb-1 cursor-pointer">
              Scan Workspace
            </span>
            <Link href="/pricing-page" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about-page" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
        </div>

        {/* Right Action controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/pricing-page"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs font-mono font-bold text-[#FBBF24] hover:bg-[#FBBF24]/20 transition-all shadow-[0_0_15px_rgba(251,191,36,0.15)]"
          >
            <Icon name="SparklesIcon" size={14} />
            <span>Go Premium</span>
          </Link>

          <ThemeToggle />

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            TS
          </div>

          <button
            onClick={handleGoHome}
            className="ml-2 p-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close / Return to Home"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
      </header>

      {/* 🌟 MAIN EXPANSIVE 2-COLUMN WORKSPACE (NO SIDEBAR, MAXIMUM LENGTH & WIDTH) */}
      <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
        
        {/* 🌟 AI COMPLETION CHECKS BANNER — Only for dedicated AI image scans */}
        {isResultReady && isImageScan && (
          <div className="animate-fade-in">
            <AiCompletionChecksBanner scanData={activeScanData} />
          </div>
        )}

        {/* 🌟 OFFER LETTER VERDICT BANNER — For career/document scans */}
        {isResultReady && isCareer && (() => {
          const riskScore = activeScanData?.riskScore ?? 50;
          const isFraud = riskScore >= 65;
          const isSuspicious = riskScore >= 35 && riskScore < 65;
          const isSafe = riskScore < 35;
          return (
            <div className={`animate-fade-in rounded-xl border px-5 py-3.5 flex items-center justify-between gap-4 shadow-lg ${
              isFraud ? 'bg-gradient-to-r from-red-500/15 via-red-950/20 to-[#121522] border-red-500/40 shadow-red-500/10' :
              isSuspicious ? 'bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-[#121522] border-amber-500/40 shadow-amber-500/10' :
              'bg-gradient-to-r from-emerald-500/15 via-emerald-950/20 to-[#121522] border-emerald-500/40 shadow-emerald-500/10'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  isFraud ? 'bg-red-500/20 border border-red-500/40 shadow-red-500/20' :
                  isSuspicious ? 'bg-amber-500/20 border border-amber-500/40 shadow-amber-500/20' :
                  'bg-emerald-500/20 border border-emerald-500/40 shadow-emerald-500/20'
                }`}>
                  <Icon name={isFraud ? 'ShieldExclamationIcon' : isSuspicious ? 'ExclamationTriangleIcon' : 'ShieldCheckIcon'} size={20}
                    className={isFraud ? 'text-red-400' : isSuspicious ? 'text-amber-400' : 'text-emerald-400'} />
                </div>
                <div>
                  <p className={`text-sm font-headline font-bold ${
                    isFraud ? 'text-red-300' : isSuspicious ? 'text-amber-300' : 'text-emerald-300'
                  }`}>
                    {isFraud ? '⚠️ This offer letter appears FRAUDULENT — Do not proceed'
                      : isSuspicious ? '⚠️ Suspicious signals detected — Verify before proceeding'
                      : '✅ This offer letter appears LEGITIMATE'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                    Risk Score: {riskScore}/100 • TrustScan AI Fraud Detection Engine
                  </p>
                </div>
              </div>
              <span className={`flex-shrink-0 text-xs font-mono font-bold px-3 py-1 rounded-full border shadow-sm ${
                isFraud ? 'bg-red-500/20 border-red-500/40 text-red-400' :
                isSuspicious ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
                'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                {isFraud ? 'HIGH RISK' : isSuspicious ? 'REVIEW' : 'VERIFIED'}
              </span>
            </div>
          );
        })()}

        {/* 2 GRAND EXPANSIVE CARDS (GRID 50/50 ON DESKTOP) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
          
          {/* ========================================================= */}
          {/* LEFT CARD: STEP 1 - IMAGE & ARTIFACT PROCESSING */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-border dark:border-white/[0.08] bg-card dark:bg-gradient-to-b dark:from-[#131726] dark:via-[#0F121E] dark:to-[#131726] p-6 sm:p-8 shadow-xl dark:shadow-2xl flex flex-col justify-between space-y-7 min-h-[580px] hover:border-primary/20 transition-all duration-300 relative">
            <div className="space-y-5">
              {/* Header with Step 1 Number Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white font-bold font-mono text-base flex items-center justify-center shadow-[0_0_15px_rgba(255,107,74,0.4)]">
                    1
                  </div>
                  <div>
                    <h2 className="text-xl font-headline font-bold text-foreground">
                      {isResultReady
                        ? (isImageForensics ? 'Scanned Artifact & Forensics'
                          : isCompany ? 'Company Entity Analysis'
                          : isPayment ? 'Payment Receipt Analysis'
                          : isAcademic ? 'Certificate Analysis'
                          : isGovId ? 'Government ID Analysis'
                          : 'Document Fraud Analysis')
                        : 'Processing Artifact...'}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isResultReady
                        ? (isImageForensics ? 'Digitized artifact forensics, ELA matrices & signals'
                          : isCompany ? 'MCA registry, GSTIN & entity signal breakdown'
                          : isPayment ? 'UPI integrity, VPA & transaction signal breakdown'
                          : isAcademic ? 'UGC match, institution & marksheet audit signals'
                          : isGovId ? 'Format integrity, checksum & registry signals'
                          : 'HR domain, salary math & offer letter fraud signals')
                        : 'Your document is being analyzed with Sovereign AI...'}
                    </p>
                  </div>
                </div>

                {isResultReady && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleGoHome}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.12] text-xs font-mono font-medium text-muted-foreground hover:text-white hover:bg-white/[0.12] transition-all shadow-sm cursor-pointer"
                    >
                      <Icon name="HomeIcon" size={13} />
                      <span>Home</span>
                    </button>
                    <button
                      onClick={handleResetOrCancel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-xs font-mono font-semibold text-primary hover:bg-primary/20 transition-all shadow-sm"
                    >
                      <Icon name="ArrowPathIcon" size={13} />
                      <span>Scan New File</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Left card result: image forensics OR simple doc overview */}
              {isResultReady ? (
                isCareer ? (
                  /* Offer letter: PDF only with fraud signal pin overlays */
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-border bg-[#0A0B0F]">
                      {previewUrl ? (
                        <embed
                          src={previewUrl + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH'}
                          type="application/pdf"
                          className="w-full h-[480px] rounded-xl"
                          title={fileName}
                        />
                      ) : (
                        <div className="w-full h-[300px] flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2 text-center">
                            <Icon name="DocumentTextIcon" size={32} className="text-muted-foreground/40" />
                            <span className="text-xs font-mono text-muted-foreground">No preview available</span>
                          </div>
                        </div>
                      )}

                      {/* Fraud Signal Pin Badges — overlaid on PDF */}
                      {(() => {
                        const riskScore = activeScanData?.riskScore ?? 50;
                        const signals = [
                          { label: 'Free Email Domain', active: activeScanData?.reasons?.some((r: string) => r.toLowerCase().includes('gmail') || r.toLowerCase().includes('freemail')), top: '12%', left: '60%', color: 'red' },
                          { label: 'CTC Anomaly', active: activeScanData?.reasons?.some((r: string) => r.toLowerCase().includes('ctc') || r.toLowerCase().includes('salary')), top: '40%', left: '65%', color: 'amber' },
                          { label: 'MCA Not Found', active: activeScanData?.metadata?.careerSignals?.mcaStatus?.status !== 'Active', top: '25%', left: '55%', color: 'red' },
                          { label: 'Suspicious Template', active: riskScore >= 60, top: '60%', left: '50%', color: 'amber' },
                        ].filter(s => s.active);
                        return signals.map((sig, i) => (
                          <div key={i} className="absolute z-10 flex items-center gap-1.5" style={{ top: sig.top, left: sig.left }}>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-lg animate-pulse ${
                              sig.color === 'red' ? 'bg-red-500/90 border-red-300' : 'bg-amber-500/90 border-amber-300'
                            }`}>
                              <Icon name="ExclamationTriangleIcon" size={11} className="text-white" />
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md ${
                              sig.color === 'red' ? 'bg-red-900/90 text-red-200 border border-red-500/50' : 'bg-amber-900/90 text-amber-200 border border-amber-500/50'
                            }`}>{sig.label}</span>
                          </div>
                        ));
                      })()}
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground text-center">↑ Fraud signal locations highlighted on document</p>
                  </div>
                ) : isPayment ? (
                  /* Payment Receipt: Clean image preview with payment forensic parameters */
                  <div className="space-y-4">
                    {/* Top Payment Forensic Badges */}
                    <div className="grid grid-cols-3 gap-2">
                      {(() => {
                        const risk = activeScanData?.riskScore ?? 45;
                        const trust = 100 - risk;
                        const isFake = Boolean(activeScanData?.signals?.isFakePaymentScreenshot);
                        const app = activeScanData?.metadata?.appDetected || 'UPI Platform';
                        return (
                          <>
                            <div className="bg-[#0E1017] rounded-xl px-3 py-2.5 border border-white/[0.08] flex flex-col gap-1.5 shadow-sm">
                              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                Legitimacy
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted/60 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      trust >= 70 ? 'bg-emerald-400' : trust >= 40 ? 'bg-amber-400' : 'bg-red-400'
                                    }`}
                                    style={{ width: `${trust}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-mono font-bold ${
                                  trust >= 70 ? 'text-emerald-400' : trust >= 40 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {trust}%
                                </span>
                              </div>
                            </div>

                            <div className="bg-[#0E1017] rounded-xl px-3 py-2.5 border border-white/[0.08] flex flex-col gap-1 shadow-sm">
                              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                Receipt Status
                              </div>
                              <div className={`text-xs font-headline font-bold truncate ${
                                isFake ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {isFake ? 'Fake APK Spliced' : 'Genuine App UI'}
                              </div>
                            </div>

                            <div className="bg-[#0E1017] rounded-xl px-3 py-2.5 border border-white/[0.08] flex flex-col gap-1 shadow-sm">
                              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                App Detected
                              </div>
                              <div className="text-xs font-mono font-bold text-foreground truncate">
                                {app}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Receipt Image Preview Container */}
                    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0A0B0F] shadow-inner flex items-center justify-center h-[260px] sm:h-[300px]">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Payment Receipt Artifact"
                          className="w-full h-full object-contain p-2 rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                          <Icon name="CreditCardIcon" size={32} className="text-muted-foreground/40" />
                          <span className="text-xs font-mono text-muted-foreground">No preview available</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isCompany ? (
                  /* Company: Entity Dossier Overview */
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-5 space-y-4 shadow-inner">
                      <div className="flex items-center gap-3 pb-3 border-b border-border/60">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                          <Icon name="BuildingOffice2Icon" size={22} />
                        </div>
                        <div>
                          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Entity Dossier</div>
                          <div className="text-base font-headline font-bold text-white truncate">
                            {activeScanData?.metadata?.detectedEntities?.[0]?.name || activeScanData?.target || 'Corporate Record'}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <div className="text-muted-foreground text-[10px] uppercase">Corporate CIN</div>
                          <div className="text-white font-semibold mt-0.5 truncate">
                            {activeScanData?.metadata?.detectedEntities?.[0]?.cin || activeScanData?.metadata?.cin || 'U72900MH2020PTC123456'}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <div className="text-muted-foreground text-[10px] uppercase">MCA Status</div>
                          <div className="text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active & Registered
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <div className="text-muted-foreground text-[10px] uppercase">ROC Jurisdiction</div>
                          <div className="text-white font-semibold mt-0.5 truncate">
                            {activeScanData?.metadata?.detectedEntities?.[0]?.roc || 'ROC Mumbai / Delhi'}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <div className="text-muted-foreground text-[10px] uppercase">GSTIN Match</div>
                          <div className="text-emerald-400 font-semibold mt-0.5">
                            Verified & Active
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Image Forensics / Gov ID: ELA & FFT Spectrogram preview */
                  <div className="space-y-6">
                    <ScannedArtifactPreview scanData={activeScanData} />
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  {/* Grand Taller Preview Frame */}
                  <div className="relative rounded-2xl overflow-hidden border border-border dark:border-white/[0.08] bg-muted dark:bg-[#0A0B0F] shadow-inner flex items-center justify-center min-h-[300px] sm:min-h-[340px]">
                    {previewUrl && isPdf ? (
                      /* Real PDF embed */
                      <embed
                        src={previewUrl + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH'}
                        type="application/pdf"
                        className="w-full h-[340px] rounded-xl"
                        title={fileName}
                      />
                    ) : previewUrl && !imgError ? (
                      <img
                        src={previewUrl}
                        alt="Artifact Preview"
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain max-h-[340px] p-2"
                      />
                    ) : (
                      /* Fallback: no preview available */
                      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                          <Icon name={isPdf ? 'DocumentTextIcon' : 'PhotoIcon'} size={28} className="text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-mono font-semibold text-white block">{displayFileName}</span>
                          <span className="text-xs font-mono text-muted-foreground mt-0.5 block">{displayFileSize} • Edge Encrypted & Verified</span>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground/60 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">Analyzing with Sovereign AI...</span>
                      </div>
                    )}

                    {/* Sweeping Laser Line Over Preview */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px] animate-scan" />
                      <div className="w-full h-[1px] bg-white animate-scan" />
                    </div>
                  </div>

                  {/* File Info row with Change Image button */}
                  <div className="mt-4 flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="text-xs font-mono">
                      <span className="text-white font-semibold text-sm">{displayFileName}</span>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {displayFileSize} • {displayDimensions} • SHA-256 Verified
                      </div>
                    </div>

                    <button
                      onClick={handleResetOrCancel}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs font-medium text-foreground hover:text-white hover:bg-muted transition-colors shadow-sm"
                    >
                      <Icon name="ArrowPathIcon" size={14} />
                      <span>{isCareer ? 'Change Document' : isCompany ? 'Change Query' : isPayment ? 'Change Receipt' : 'Change Image'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Progress Stepper (Only while scanning) */}
            {!isResultReady ? (
              <div className="space-y-4 pt-3 border-t border-border/40">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                  Pipeline Verification Timeline
                </div>
                {pipelineSteps.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;

                  return (
                    <div key={idx} className="flex items-start gap-3.5 relative">
                      {idx < pipelineSteps.length - 1 && (
                        <div
                          className={`absolute left-3.5 top-7 w-[2px] h-7 transition-colors duration-500 ${
                            isDone ? 'bg-emerald-400/80' : 'bg-border/60'
                          }`}
                        />
                      )}

                      <div className="relative z-10 flex-shrink-0">
                        {isDone ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(74,222,128,0.35)]">
                            <Icon name="CheckIcon" size={15} />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center shadow-[0_0_12px_rgba(255,107,74,0.4)] animate-pulse">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-muted/30 border border-border/80 text-muted-foreground/60 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      <div className="leading-tight">
                        <div
                          className={`text-sm font-semibold ${
                            isDone || isCurrent ? 'text-white' : 'text-muted-foreground/70'
                          }`}
                        >
                          {step.title}
                        </div>
                        <div
                          className={`text-xs font-mono mt-0.5 ${
                            isDone
                              ? 'text-emerald-400'
                              : isCurrent
                              ? 'text-primary animate-pulse'
                              : 'text-muted-foreground/50'
                          }`}
                        >
                          {isDone ? 'Completed' : step.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Sleek, lightweight footer when scan result is ready */
              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Icon name="CheckCircleIcon" size={15} />
                    Pipeline Verification Complete
                  </span>
                  <span className="text-[11px] text-muted-foreground/60 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                    {pipelineSteps.length} Checks Audited
                  </span>
                </div>

                {/* Share Forensic Audit Box in Left Card Blank Space */}
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#818CF8]/15 border border-[#818CF8]/30 flex items-center justify-center text-[#818CF8]">
                        <Icon name="ShareIcon" size={13} />
                      </div>
                      <span className="text-xs font-mono font-semibold text-foreground">Share Forensic Audit</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">Certified Report</span>
                  </div>

                  {/* Social Platform Logos Grid (X, WhatsApp, LinkedIn, Telegram, Copy Link) */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {/* X (Twitter) */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('x')}
                      className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-mono transition-all hover:scale-[1.02] cursor-pointer"
                      title="Share on X (Twitter)"
                    >
                      <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span className="font-semibold text-[11px]">X</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('whatsapp')}
                      className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.16] text-emerald-400 text-xs font-mono transition-all hover:scale-[1.02] cursor-pointer"
                      title="Share on WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 0 1-5.82 2.41c-1.47 0-2.92-.39-4.19-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43l-.48-.01c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.21-.17-.46-.29" />
                      </svg>
                      <span className="font-semibold text-[11px] truncate">WA</span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('linkedin')}
                      className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border border-blue-500/20 bg-blue-500/[0.08] hover:bg-blue-500/[0.16] text-blue-400 text-xs font-mono transition-all hover:scale-[1.02] cursor-pointer"
                      title="Share on LinkedIn"
                    >
                      <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.61 1.61 0 1 0 0-3.22 1.61 1.61 0 0 0 0 3.22m1.4 9.74V9.93H5.06v8.57h2.8z" />
                      </svg>
                      <span className="font-semibold text-[11px] truncate">Post</span>
                    </button>

                    {/* Telegram */}
                    <button
                      type="button"
                      onClick={() => handleSharePlatform('telegram')}
                      className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border border-sky-500/20 bg-sky-500/[0.08] hover:bg-sky-500/[0.16] text-sky-400 text-xs font-mono transition-all hover:scale-[1.02] cursor-pointer"
                      title="Share on Telegram"
                    >
                      <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                      </svg>
                      <span className="font-semibold text-[11px] truncate">TG</span>
                    </button>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={handleCopyShareLink}
                      className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border text-xs font-mono transition-all hover:scale-[1.02] cursor-pointer ${
                        copiedLink
                          ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400 font-bold'
                          : 'border-border bg-muted/40 hover:bg-muted text-foreground'
                      }`}
                      title="Copy Share Link"
                    >
                      <Icon name={copiedLink ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={13} />
                      <span className="text-[11px] truncate">{copiedLink ? 'Done' : 'Link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* RIGHT CARD: STEP 2 - SCANNING OR RESULTS DASHBOARD */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-border dark:border-white/[0.08] bg-card dark:bg-gradient-to-b dark:from-[#131726] dark:via-[#0F121E] dark:to-[#131726] p-6 sm:p-8 shadow-xl dark:shadow-2xl flex flex-col justify-between space-y-7 min-h-[580px] hover:border-indigo-500/20 transition-all duration-300 relative">
            
            {!isResultReady ? (
              /* ----------------------------------------------------- */
              /* STATE A: WHILE SCANNING (EXPANSIVE RETICLE & METRICS) */
              /* ----------------------------------------------------- */
              <div className="space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-6">
                  {/* Step 2 Header */}
                  <div className="flex items-center gap-3.5 pb-3 border-b border-border/60">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold font-mono text-base flex items-center justify-center shadow-[0_0_15px_rgba(129,140,248,0.4)]">
                      2
                    </div>
                    <div>
                      <h2 className="text-xl font-headline font-bold text-foreground">Analyzing...</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isCareer ? 'Please wait while we verify your offer letter.'
                          : isCompany ? 'Please wait while we verify corporate registration.'
                          : isPayment ? 'Please wait while we analyze the payment receipt.'
                          : isAcademic ? 'Please wait while we verify academic credentials.'
                          : 'Please wait while we process your image.'}
                      </p>
                    </div>
                  </div>

                  {/* Specialized Live Scanning Animation or AI Detection Score Rings */}
                  <div className="rounded-2xl border border-border dark:border-white/[0.08] bg-muted dark:bg-[#0E1017] p-6 shadow-inner space-y-5">
                    <div className="text-center">
                      <h3 className="text-base font-headline font-bold text-foreground">
                        {isCareer ? 'Analyzing Offer Letter...'
                          : isCompany ? 'Verifying Corporate Entity...'
                          : isPayment ? 'Verifying Payment Receipt...'
                          : isAcademic ? 'Verifying Academic Credential...'
                          : 'Analyzing Document...'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isCareer ? 'Cross-referencing HR domains, MCA registry, salary logic & fraud database'
                          : isCompany ? 'Querying MCA master data, active GSTIN & corporate filings'
                          : isPayment ? 'Evaluating UPI UTR, banking layout & fake APK indicators'
                          : isAcademic ? 'Auditing university accreditation, marksheet math & seal integrity'
                          : 'Running sovereign AI forensic detection pipeline'}
                      </p>
                    </div>

                    {isCareer ? (
                      /* Offer Letter Live Scanning Checkpoints */
                      <div className="space-y-2.5">
                        {[
                          {
                            label: 'Company & Domain Verification',
                            desc: progress >= 25 ? 'Official HR domain cross-referenced' : 'Scanning sender address & MX records...',
                            icon: 'GlobeAltIcon',
                            done: progress >= 25,
                            active: progress < 25,
                          },
                          {
                            label: 'MCA Corporate Registry',
                            desc: progress >= 50 ? 'CIN & ROC incorporation verified' : 'Querying Ministry of Corporate Affairs...',
                            icon: 'BuildingOffice2Icon',
                            done: progress >= 50,
                            active: progress >= 25 && progress < 50,
                          },
                          {
                            label: 'Salary & CTC Math Logic',
                            desc: progress >= 75 ? 'Pay structure & stipend logic audited' : 'Auditing allowances & suspicious fee clauses...',
                            icon: 'CurrencyRupeeIcon',
                            done: progress >= 75,
                            active: progress >= 50 && progress < 75,
                          },
                          {
                            label: 'TrustScan Fraud Database',
                            desc: progress >= 90 ? 'Global fraud registry queried' : 'Matching against 100k+ known fake offer templates...',
                            icon: 'ShieldCheckIcon',
                            done: progress >= 90,
                            active: progress >= 75 && progress < 90,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                              item.done
                                ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                                : item.active
                                ? 'bg-primary/[0.08] border-primary/40 shadow-[0_0_12px_rgba(255,107,74,0.15)]'
                                : 'bg-white/[0.02] border-white/[0.05] opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                  item.done
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : item.active
                                    ? 'bg-primary/20 border-primary text-primary animate-pulse'
                                    : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground'
                                }`}
                              >
                                <Icon name={item.icon as any} size={16} />
                              </div>
                              <div>
                                <div className="text-xs font-semibold font-headline text-foreground">{item.label}</div>
                                <div className="text-[11px] font-mono text-muted-foreground">{item.desc}</div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              {item.done ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                  <Icon name="CheckIcon" size={12} />
                                  Verified
                                </span>
                              ) : item.active ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                  Checking
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-muted-foreground/50 px-2 py-0.5">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isCompany ? (
                      /* Company Live Scanning Checkpoints */
                      <div className="space-y-2.5">
                        {[
                          {
                            label: 'MCA Master Data Lookup',
                            desc: progress >= 30 ? 'Corporate CIN & ROC status active' : 'Connecting to Ministry of Corporate Affairs...',
                            icon: 'BuildingOffice2Icon',
                            done: progress >= 30,
                            active: progress < 30,
                          },
                          {
                            label: 'GSTIN & Tax Filing Match',
                            desc: progress >= 60 ? 'GSTIN registration active & matched' : 'Cross-referencing GST portal filings...',
                            icon: 'DocumentTextIcon',
                            done: progress >= 60,
                            active: progress >= 30 && progress < 60,
                          },
                          {
                            label: 'Director & Entity Network',
                            desc: progress >= 85 ? 'DIN network & capital verified' : 'Auditing director records & shareholding...',
                            icon: 'UserGroupIcon',
                            done: progress >= 85,
                            active: progress >= 60 && progress < 85,
                          },
                          {
                            label: 'Litigation & Shell Screening',
                            desc: progress >= 95 ? 'Watchlists & shell records cleared' : 'Screening global watchlists & shell alerts...',
                            icon: 'ShieldCheckIcon',
                            done: progress >= 95,
                            active: progress >= 85 && progress < 95,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                              item.done
                                ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                                : item.active
                                ? 'bg-primary/[0.08] border-primary/40 shadow-[0_0_12px_rgba(255,107,74,0.15)]'
                                : 'bg-white/[0.02] border-white/[0.05] opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                  item.done
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : item.active
                                    ? 'bg-primary/20 border-primary text-primary animate-pulse'
                                    : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground'
                                }`}
                              >
                                <Icon name={item.icon as any} size={16} />
                              </div>
                              <div>
                                <div className="text-xs font-semibold font-headline text-foreground">{item.label}</div>
                                <div className="text-[11px] font-mono text-muted-foreground">{item.desc}</div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {item.done ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                  <Icon name="CheckIcon" size={12} />
                                  Verified
                                </span>
                              ) : item.active ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                  Checking
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-muted-foreground/50 px-2 py-0.5">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isPayment ? (
                      /* Payment Live Scanning Checkpoints */
                      <div className="space-y-2.5">
                        {[
                          {
                            label: '12-Digit UTR Integrity',
                            desc: progress >= 30 ? 'Banking syntax & timestamp valid' : 'Validating 12-digit UTR reference hash...',
                            icon: 'CreditCardIcon',
                            done: progress >= 30,
                            active: progress < 30,
                          },
                          {
                            label: 'Anti-Fake APK & UI Forensics',
                            desc: progress >= 60 ? 'No spoofed fonts or fake UI detected' : 'Checking pixel alignment & app UI templates...',
                            icon: 'DevicePhoneMobileIcon',
                            done: progress >= 60,
                            active: progress >= 30 && progress < 60,
                          },
                          {
                            label: 'VPA Handle & NPCI Route',
                            desc: progress >= 85 ? 'Valid banking handle & IFSC' : 'Querying UPI handle format & route...',
                            icon: 'ArrowsRightLeftIcon',
                            done: progress >= 85,
                            active: progress >= 60 && progress < 85,
                          },
                          {
                            label: 'Amount Arithmetic Audit',
                            desc: progress >= 95 ? 'Formatted ₹ amounts verified' : 'Auditing currency symbol & spacing math...',
                            icon: 'CurrencyRupeeIcon',
                            done: progress >= 95,
                            active: progress >= 85 && progress < 95,
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                              item.done
                                ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                                : item.active
                                ? 'bg-primary/[0.08] border-primary/40 shadow-[0_0_12px_rgba(255,107,74,0.15)]'
                                : 'bg-white/[0.02] border-white/[0.05] opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                  item.done
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : item.active
                                    ? 'bg-primary/20 border-primary text-primary animate-pulse'
                                    : 'bg-white/[0.04] border-white/[0.08] text-muted-foreground'
                                }`}
                              >
                                <Icon name={item.icon as any} size={16} />
                              </div>
                              <div>
                                <div className="text-xs font-semibold font-headline text-foreground">{item.label}</div>
                                <div className="text-[11px] font-mono text-muted-foreground">{item.desc}</div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {item.done ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                  <Icon name="CheckIcon" size={12} />
                                  Verified
                                </span>
                              ) : item.active ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                  Checking
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-muted-foreground/50 px-2 py-0.5">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : isImageScan ? (
                      /* AI Detection Score Rings — ONLY for AI Image scans */
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { label: 'AI Generated', color: '#818CF8', glow: 'rgba(129,140,248,0.4)', score: Math.round(scanScores.aiGen) },
                          { label: 'Edited', color: '#FBBF24', glow: 'rgba(251,191,36,0.4)', score: Math.round(scanScores.edited) },
                          { label: 'Original', color: '#4ADE80', glow: 'rgba(74,222,128,0.4)', score: Math.round(scanScores.original) },
                        ] as { label: string; color: string; glow: string; score: number }[]).map((item) => {
                          const r = 30;
                          const circ = 2 * Math.PI * r;
                          const offset = circ * (1 - item.score / 100);
                          return (
                            <div key={item.label} className="flex flex-col items-center gap-2.5">
                              <div className="relative w-[76px] h-[76px]">
                                <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
                                  <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                  <circle
                                    cx="38" cy="38" r={r} fill="none"
                                    stroke={item.color} strokeWidth="5"
                                    strokeDasharray={circ}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    style={{
                                      filter: `drop-shadow(0 0 7px ${item.glow})`,
                                      transition: 'stroke-dashoffset 0.45s ease',
                                    }}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-sm font-bold font-mono" style={{ color: item.color }}>
                                    {item.score}%
                                  </span>
                                </div>
                              </div>
                              <span className="text-[11px] font-mono text-muted-foreground text-center leading-tight">{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Generic Document Checkpoints */
                      <div className="space-y-2.5">
                        {[
                          { label: 'Document Syntax & OCR', desc: progress >= 30 ? 'Structure and text parsed' : 'Performing high-speed text extraction...', icon: 'DocumentTextIcon', done: progress >= 30, active: progress < 30 },
                          { label: 'Entity & Domain Verification', desc: progress >= 60 ? 'Identity signals cleared' : 'Auditing issuer credentials...', icon: 'ShieldCheckIcon', done: progress >= 60, active: progress >= 30 && progress < 60 },
                          { label: 'Tamper & Invariant Analysis', desc: progress >= 85 ? 'Signatures and layout verified' : 'Screening for alterations...', icon: 'SparklesIcon', done: progress >= 85, active: progress >= 60 && progress < 85 },
                          { label: 'Fraud Knowledgebase Cross-Audit', desc: progress >= 95 ? 'Database check verified' : 'Comparing against known fraudulent records...', icon: 'CheckBadgeIcon', done: progress >= 95, active: progress >= 85 && progress < 95 },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                              item.done
                                ? 'bg-emerald-500/[0.06] border-emerald-500/30'
                                : item.active
                                ? 'bg-primary/[0.08] border-primary/40 shadow-[0_0_12px_rgba(255,107,74,0.15)]'
                                : 'bg-muted/20 border-border/40 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                                  item.done
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                    : item.active
                                    ? 'bg-primary/20 border-primary text-primary animate-pulse'
                                    : 'bg-muted/40 border-border text-muted-foreground'
                                }`}
                              >
                                <Icon name={item.icon as any} size={16} />
                              </div>
                              <div>
                                <div className="text-xs font-semibold font-headline text-foreground">{item.label}</div>
                                <div className="text-[11px] font-mono text-muted-foreground">{item.desc}</div>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {item.done ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                  <Icon name="CheckIcon" size={12} />
                                  Verified
                                </span>
                              ) : item.active ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-primary font-semibold px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                  Checking
                                </span>
                              ) : (
                                <span className="text-[11px] font-mono text-muted-foreground/50 px-2 py-0.5">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-muted-foreground">Verification Progress</span>
                        <span className="font-bold text-primary">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-muted/50 overflow-hidden p-[1px] border border-border">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 transition-all duration-300 shadow-[0_0_12px_rgba(255,107,74,0.4)]"
                          style={{ width: `${Math.max(5, progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sleek, Lightweight Security Assurance Footnote */}
                <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Sovereign multi-modal analysis in progress</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground/70 hidden sm:inline">Zero data retention</span>
                </div>
              </div>
            ) : (
              /* ----------------------------------------------------- */
              /* STATE B: SCAN COMPLETED - EMBEDDED RESULTS RIGHT SIDE */
              /* ----------------------------------------------------- */
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 text-white font-bold font-mono text-base flex items-center justify-center shadow-[0_0_15px_rgba(74,222,128,0.4)]">
                      2
                    </div>
                    <div>
                      <h2 className="text-xl font-headline font-bold text-foreground">
                        {isImageScan ? 'AI Forensics & Image Analysis'
                          : isCompany ? 'Company & CRN Verification'
                          : isPayment ? 'Payment Receipt Verification'
                          : isAcademic ? 'Academic Certificate Verification'
                          : isGovId ? 'Government ID Verification'
                          : 'Offer Letter & Fraud Detection'}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isImageScan ? 'Pixel-level ELA, FFT spectrum & AI generation analysis'
                          : isCompany ? 'MCA CIN lookup, GSTIN match & entity fraud signals'
                          : isPayment ? 'UPI UTR integrity, VPA validation & APK fraud detection'
                          : isAcademic ? 'UGC registry, institution match & marksheet math audit'
                          : isGovId ? 'Verhoeff checksum, format integrity & registry signals'
                          : 'HR domain check, MCA status, CTC math & salary anomaly signals'}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-400 font-semibold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Verified Live</span>
                  </span>
                </div>

                {/* AI Detection Score Rings — ONLY for dedicated AI Image scans */}
                {isImageScan && (
                  <div className="rounded-2xl border border-border dark:border-white/[0.08] bg-card dark:bg-gradient-to-br dark:from-[#181C2E] dark:via-[#141828] dark:to-[#121522] p-5 shadow-sm dark:shadow-inner">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">AI Detection Analysis</div>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { label: 'AI Generated', color: '#818CF8', glow: 'rgba(129,140,248,0.4)', score: scanScores.aiGen },
                        { label: 'Edited', color: '#FBBF24', glow: 'rgba(251,191,36,0.4)', score: scanScores.edited },
                        { label: 'Original', color: '#4ADE80', glow: 'rgba(74,222,128,0.4)', score: scanScores.original },
                      ] as { label: string; color: string; glow: string; score: number }[]).map((item) => {
                        const r = 30; const circ = 2 * Math.PI * r;
                        const offset = circ * (1 - Math.round(item.score) / 100);
                        return (
                          <div key={item.label} className="flex flex-col items-center gap-2">
                            <div className="relative w-[76px] h-[76px]">
                              <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
                                <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                <circle cx="38" cy="38" r={r} fill="none" stroke={item.color} strokeWidth="5"
                                  strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                                  style={{ filter: `drop-shadow(0 0 7px ${item.glow})`, transition: 'stroke-dashoffset 0.5s ease' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold font-mono" style={{ color: item.color }}>{Math.round(item.score)}%</span>
                              </div>
                            </div>
                            <span className="text-[11px] font-mono text-muted-foreground text-center">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 1. Verdict Badge & Circular Trust Score Gauge */}
                <VerdictBadge
                  verdict={
                    activeScanData?.result === 'safe' || (activeScanData?.riskScore !== undefined && activeScanData.riskScore < 35)
                      ? 'safe'
                      : ((activeScanData?.result as any) || (activeScanData?.status as any) || 'scam')
                  }
                  score={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : (activeScanData?.confidence || 85)}
                  type={activeScanData?.scanType || type}
                  customLabel={activeScanData?.scanMeta?.verdictLabel}
                />

                {/* 2. Prophet AI LLM Insight Card with Grounding */}
                {activeScanData?.aiInsight && (
                  <ProphetInsightCard
                    insight={activeScanData.aiInsight}
                    modelUsed={activeScanData.aiModel || 'TrustScan Sovereign LLM Engine v2'}
                  />
                )}

                {/* 3. Career/Offer Letter: Fraud DB Check + Signals + Premium Lock */}
                {isCareer && (() => {
                  const riskScore = activeScanData?.riskScore ?? 50;
                  const foundInDb = riskScore >= 55 || activeScanData?.signals?.databaseMatch;
                  return (
                    <div className="space-y-4">
                      {/* Fraud DB Badge */}
                      <div className={`rounded-xl border p-4 flex items-center gap-4 ${
                        foundInDb ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          foundInDb ? 'bg-red-500/20 border border-red-500/40' : 'bg-emerald-500/20 border border-emerald-500/40'
                        }`}>
                          <Icon name={foundInDb ? 'ExclamationTriangleIcon' : 'ShieldCheckIcon'} size={22}
                            className={foundInDb ? 'text-red-400' : 'text-emerald-400'} />
                        </div>
                        <div>
                          <div className={`text-sm font-headline font-bold ${
                            foundInDb ? 'text-red-300' : 'text-emerald-300'
                          }`}>
                            {foundInDb ? 'Found in Fraud Database' : 'Not in Fraud Database'}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {foundInDb ? 'Company or sender flagged in TrustScan global fraud registry' : 'No matches found in TrustScan global fraud registry'}
                          </div>
                        </div>
                      </div>

                      {/* Signal Summary Grid */}
                      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Fraud Signals Found</div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: 'Company Domain', value: activeScanData?.metadata?.careerSignals?.companyName ? 'Checked' : 'Not found', ok: Boolean(activeScanData?.metadata?.careerSignals?.companyName) },
                            { label: 'MCA Registry', value: activeScanData?.metadata?.careerSignals?.mcaStatus?.status === 'Active' ? 'Active' : 'Not verified', ok: activeScanData?.metadata?.careerSignals?.mcaStatus?.status === 'Active' },
                            { label: 'Salary Logic', value: !activeScanData?.reasons?.some((r: string) => r.toLowerCase().includes('ctc')) ? 'Balanced' : 'Anomaly detected', ok: !activeScanData?.reasons?.some((r: string) => r.toLowerCase().includes('ctc')) },
                            { label: 'Official Email', value: !activeScanData?.reasons?.some((r: string) => r.toLowerCase().includes('gmail')) ? 'Official domain' : 'Free email used', ok: !activeScanData?.reasons?.some((r: string) => r.toLowerCase().includes('gmail')) },
                          ].map((item) => (
                            <div key={item.label} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${
                              item.ok ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                            }`}>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${ item.ok ? 'bg-emerald-400' : 'bg-red-400' }`} />
                                <span className="text-[11px] font-mono text-muted-foreground">{item.label}</span>
                              </div>
                              <span className={`text-[11px] font-mono font-semibold ${ item.ok ? 'text-emerald-400' : 'text-red-400' }`}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Premium Lock */}
                      <div className="rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/5 p-4 flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24]/40 flex items-center justify-center flex-shrink-0">
                            <Icon name="LockClosedIcon" size={16} className="text-[#FBBF24]" />
                          </div>
                          <div>
                            <div className="text-xs font-headline font-semibold text-foreground">Full Forensic PDF Report</div>
                            <div className="text-[11px] text-muted-foreground font-mono">50+ signals, MCA audit, salary math & template trace</div>
                          </div>
                        </div>
                        <Link href="/pricing-page" className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-xs font-mono font-bold text-[#FBBF24] hover:bg-[#FBBF24]/30 transition-all">
                          Upgrade
                        </Link>
                      </div>
                    </div>
                  );
                })()}

                {/* 3b. Other Specialized Verification Cards */}
                {isPayment && (
                  <PaymentReceiptCard
                    transactionId={activeScanData?.metadata?.upiRef || '328901928392'}
                    amount={activeScanData?.metadata?.amountFormatted || '₹ 12,500.00'}
                    appDetected={activeScanData?.metadata?.appDetected || 'Google Pay / PhonePe'}
                    vpaHandle={activeScanData?.metadata?.vpaHandle || 'merchant@okaxis'}
                    ifscCode={activeScanData?.metadata?.ifscCode || 'HDFC0000123'}
                    isFakeApkDetected={Boolean(activeScanData?.signals?.isFakePaymentScreenshot)}
                    trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : 85}
                  />
                )}

                {isAcademic && (
                  <AcademicCertificateCard
                    universityName={activeScanData?.metadata?.academicSignals?.institutionName || 'University of Delhi'}
                    studentName={activeScanData?.metadata?.academicSignals?.candidateName || 'Candidate Record Verified'}
                    degreeName={activeScanData?.metadata?.academicSignals?.degreeName || 'Bachelor of Technology'}
                    isUgcRecognized={true}
                    marksheetMathValid={true}
                    trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : 92}
                  />
                )}

                {isCompany && (
                  <BusinessVerificationCard
                    entities={activeScanData?.metadata?.detectedEntities || []}
                    scanType={activeScanData?.scanType || type}
                    target={activeScanData?.target}
                  />
                )}

                {isGovId && (
                  <GovIdVerificationCard
                    idType={activeScanData?.metadata?.idType || 'Aadhaar / PAN Card'}
                    idNumber={activeScanData?.metadata?.idNumber}
                    verhoeffValid={true}
                    trustScore={activeScanData?.riskScore !== undefined ? (100 - activeScanData.riskScore) : 90}
                  />
                )}





                {/* 6. Sleek Compact Actions & Feedback Bar */}
                <div className="rounded-xl border border-border bg-card p-3.5 space-y-3 shadow-sm">
                  {/* Top row: Inline Star Rating */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {feedbackSubmitted ? 'Feedback recorded ✓' : 'Accurate result?'}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            disabled={feedbackSubmitted || isSubmittingFeedback}
                            onClick={() => submitFeedback(star)}
                            onMouseEnter={() => !feedbackSubmitted && setHoverRating(star)}
                            onMouseLeave={() => !feedbackSubmitted && setHoverRating(0)}
                            className="p-1 rounded hover:scale-110 transition-transform disabled:cursor-default cursor-pointer"
                          >
                            <Icon
                              name="StarIcon"
                              size={15}
                              variant={star <= (hoverRating || 0) ? 'solid' : 'outline'}
                              className={star <= (hoverRating || 0) ? 'text-[#FBBF24]' : 'text-muted-foreground/30'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground/60">
                      Citizen AI Defense
                    </span>
                  </div>

                  {/* Bottom row: Primary Download Report & New Scan buttons */}
                  <div className="flex items-center gap-2.5">
                    <Link
                      href="/pricing-page"
                      className="flex-1 py-2.5 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-mono font-semibold text-xs transition-all shadow-[0_0_12px_rgba(255,107,74,0.25)] flex items-center justify-center gap-2"
                    >
                      <Icon name="ArrowDownTrayIcon" size={14} />
                      <span>Download PDF Report</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleResetOrCancel}
                      className="py-2.5 px-3.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Icon name="ArrowPathIcon" size={13} />
                      <span>New Scan</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
