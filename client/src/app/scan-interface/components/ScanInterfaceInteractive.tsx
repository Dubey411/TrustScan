'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { performScan, getUserProfile } from '@/api/scan';
import { useAuth } from '@/context/AuthContext';

import Icon from '@/components/ui/AppIcon';
import ScanTypeCard from './ScanTypeCard';
import TextInputArea from './TextInputArea';
import LinkInputArea from './LinkInputArea';
import FileUploadArea from './FileUploadArea';
import ScanProgress from './ScanProgress';
import HelpTooltip from './HelpTooltip';
import KeyboardShortcuts from './KeyboardShortcuts';

interface ScanType {
  id: string;
  icon: string;
  title: string;
  description: string;
  inputType: 'text' | 'link' | 'file';
  placeholder?: string;
  acceptedFormats?: string[];
  maxSize?: number;
  maxLength?: number;
  buttonText: string;
}

interface ScanInterfaceInteractiveProps {
  onScanComplete?: (data: any) => void;
}

export default function ScanInterfaceInteractive({ onScanComplete }: ScanInterfaceInteractiveProps) {
  const router = useRouter(); 
  const { user } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  const [selectedScanType, setSelectedScanType] = useState<string>('document');
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'standard' | 'deep'>('basic');
  const [priorityLevel, setPriorityLevel] = useState<'normal' | 'urgent'>('normal');
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [senderId, setSenderId] = useState('');
  const [isLinkValid, setIsLinkValid] = useState(true);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserCredits(profile.credits || 0);
        } catch (e) {
          console.error("Failed to fetch credits", e);
        }
      }
    };
    if (isHydrated && user) {
      fetchCredits();
    }
  }, [isHydrated, user]);

  const scanTypes: ScanType[] = [
    {
      id: 'document',
      icon: 'DocumentCheckIcon',
      title: 'Fake Offer Letter Check',
      description: 'Detect fake HR emails, forged company seals, CTC math, and fee scams',
      inputType: 'file',
      acceptedFormats: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'],
      maxSize: 15 * 1024 * 1024,
      buttonText: 'Scan Offer Letter for Fraud'
    },
    {
      id: 'payment',
      icon: 'CreditCardIcon',
      title: 'UPI & Payment Fraud Forensics',
      description: 'Detect fake payment APKs, altered ₹ amounts, 12-digit UTR integrity, and IFSC resolver',
      inputType: 'file',
      acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
      maxSize: 15 * 1024 * 1024,
      buttonText: 'Verify Payment Receipt'
    },
    {
      id: 'image',
      icon: 'PhotoIcon',
      title: 'AI Image Detection & Forensics',
      description: 'Detect AI-generated images (Stable Diffusion, Midjourney, DALL-E, FLUX) and pixel tampering',
      inputType: 'file',
      acceptedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
      maxSize: 15 * 1024 * 1024,
      buttonText: 'Scan Image for AI Generation'
    },
    {
      id: 'company',
      icon: 'BuildingOffice2Icon',
      title: 'Company & CIN',
      description: 'Verify MCA corporate records, 21-digit CIN, and active GSTIN',
      inputType: 'text',
      placeholder: 'Enter Company Name, 21-digit MCA CIN (e.g. U72900MH2020PTC123456), or GSTIN...',
      maxLength: 500,
      buttonText: 'Verify Company'
    },
  ];

  const currentScanType = scanTypes.find((type) => type.id === selectedScanType);

  const canScan = (): boolean => {
    if (!currentScanType) return false;
    
    switch (currentScanType.inputType) {
      case 'text':
        return textInput.trim().length > 1;
      case 'link':
        return linkInput.trim().length > 0 && isLinkValid;
      case 'file':
        return selectedFile !== null;
      default:
        return false;
    }
  };

  const handleScan = async () => {
    if (!canScan()) return;
    
    setIsScanning(true);
    setScanResult(null);
    setError(null);

    let targetContent = '';
    if (currentScanType?.inputType === 'text') {
        targetContent = textInput;
    } else if (currentScanType?.inputType === 'link') {
        targetContent = linkInput;
    } else {
        targetContent = selectedFile ? selectedFile.name : 'Document File';
    }

    try {
        const scanData: any = { 
            type: selectedScanType, 
            userId: user?.uid || undefined,
            userEmail: user?.email || undefined,
            depth: analysisDepth,
            senderId: senderId || undefined
        };

        if (selectedFile) {
            scanData.file = selectedFile;
        } else {
            scanData.content = targetContent;
        }

        const result = await performScan(scanData);

        if (selectedScanType === 'company') {
           const entity = (result as any).signals?.detectedEntities?.[0] || (result as any).metadata?.detectedEntities?.[0];
           const enrichment = entity?.enrichment;
           
           if (enrichment) {
              const query = new URLSearchParams({
                name: enrichment.name,
                cin: entity.value,
                address: enrichment.address,
                status: enrichment.status,
                type: enrichment.class,
                valid: String(entity.isValid),
                regDate: enrichment.incDate || entity.parsed?.year || 'N/A',
                scanId: (result as any).id || (result as any)._id || ''
              }).toString();
              
              router.push(`/company-report?${query}`);
              return; 
           }
        }

        const filePreview = selectedFile ? URL.createObjectURL(selectedFile) : null;
        const fileSizeFormatted = selectedFile ? (
          selectedFile.size < 1024 * 1024 
            ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
            : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        ) : undefined;

        // Smooth minimum animation duration for holographic pipeline visualization
        await new Promise(resolve => setTimeout(resolve, 3200));

        const normalizedPayload = {
            id: (result as any).id || (result as any)._id,
            target: targetContent,
            scanType: selectedScanType,
            type: selectedScanType,
            depth: analysisDepth,
            result: (result as any).status || (result as any).result || ((result as any).riskScore < 35 ? 'safe' : 'fraud'),
            confidence: (result as any).confidence,
            riskScore: (result as any).riskScore,
            reasons: (result as any).reasons || [],
            signals: (result as any).signals || {},
            scanMeta: (result as any).scanMeta || {},
            metadata: (result as any).metadata || {},
            recommendation: (result as any).recommendation || [],
            aiInsight: (result as any).aiInsight,
            aiModel: (result as any).aiModel,
            trustScanReport: (result as any).trustScanReport,
            previewUrl: filePreview,
            fileName: selectedFile ? selectedFile.name : targetContent,
            fileSizeFormatted,
            apiResult: {
                ...(result as any),
                scanType: selectedScanType,
                type: selectedScanType,
                depth: analysisDepth,
                previewUrl: filePreview,
                fileName: selectedFile ? selectedFile.name : targetContent,
                fileSizeFormatted,
            }
        };

        // Cache latest scan in localStorage
        localStorage.setItem('latestScan', JSON.stringify(normalizedPayload));

        if (onScanComplete) {
            onScanComplete(normalizedPayload);
        }

        // Set in-place scan result on same page without redirecting
        setScanResult(normalizedPayload);
        setIsScanning(false);
    } catch (err) {
        console.error("Scan failed", err);
        setError("Scan failed. Please check your connection and try again.");
        setIsScanning(false);
    }
  };

  const handleClear = () => {
    setTextInput('');
    setLinkInput('');
    setSenderId('');
    setSelectedFile(null);
    setScanResult(null);
    setError(null);
  };

  return (
    <div className="py-6 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-card border border-border text-xs font-mono text-primary mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>India's AI Fraud & Credential Engine</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground mb-4 leading-tight tracking-tight">
              AI <span className="text-gradient-sovereign">Fraud & Credential</span> Scanner
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Verify <strong>Job Offer Letters</strong>, audit <strong>UPI Payment Receipts</strong>, inspect <strong>AI Images & Forensics</strong>, and check <strong>MCA Companies</strong> with deep sovereign intelligence.
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg max-w-md mx-auto">
                <p className="flex items-center justify-center gap-2">
                  <Icon name="ExclamationTriangleIcon" size={18} />
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {scanTypes.map((type) => (
              <ScanTypeCard
                key={type.id}
                icon={type.icon}
                title={type.title}
                description={type.description}
                isSelected={selectedScanType === type.id}
                onClick={() => {
                  setSelectedScanType(type.id);
                  handleClear();
                }}
              />
            ))}
          </div>

          <div className="bg-card dark:bg-gradient-to-b dark:from-[#131726] dark:via-[#0F121E] dark:to-[#131726] border border-border dark:border-white/[0.08] rounded-2xl shadow-xl dark:shadow-2xl p-6 md:p-8 mb-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name={currentScanType?.icon as any} size={24} variant="solid" className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-headline font-bold text-foreground">{currentScanType?.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentScanType?.description}</p>
                </div>
              </div>
              <HelpTooltip
                content="Upload your document or enter company details. Our AI and mathematical rules engine verify authenticity instantly."
                position="left"
              />
            </div>

            <div className="mb-6">
              {currentScanType?.inputType === 'text' && (
                <div className="relative">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={currentScanType.placeholder || ''}
                    maxLength={currentScanType.maxLength || 500}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleScan();
                    }}
                    className="w-full p-4 bg-muted/50 text-foreground border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-200 outline-none font-medium placeholder:text-muted-foreground/60 shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                    <Icon name="MagnifyingGlassIcon" size={20} />
                  </div>
                </div>
              )}
              
              {currentScanType?.inputType === 'link' && (
                <LinkInputArea 
                  value={linkInput} 
                  onChange={setLinkInput} 
                  placeholder={currentScanType.placeholder}
                  onScan={handleScan}
                  onValidChange={setIsLinkValid}
                />
              )}
              
              {currentScanType?.inputType === 'file' && (
                <FileUploadArea
                  onFileSelect={setSelectedFile}
                  acceptedFormats={currentScanType.acceptedFormats || []}
                  maxSize={currentScanType.maxSize || 15 * 1024 * 1024}
                />
              )}
            </div>

            {selectedScanType !== 'company' && (
            <div className="hidden md:block mb-8 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-headline font-semibold text-foreground">Analysis Depth</h3>
                  {user && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md border ${user?.email === 'trustscan.ai@gmail.com' ? 'bg-primary/20 border-primary text-primary' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                      {user?.email === 'trustscan.ai@gmail.com' ? 'Admin Access' : `${userCredits} Credits Available`}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      analysisDepth === 'basic'
                        ? 'border-primary bg-primary/5 shadow-brand'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                    onClick={() => setAnalysisDepth('basic')}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="BoltIcon" size={20} variant="solid" className="text-primary" />
                      <span className="font-semibold text-foreground">Basic</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Standard AI Check</p>
                  </button>

                  <button
                    onClick={() => {
                      if (user) {
                        setAnalysisDepth('standard');
                      } else {
                        router.push('/login');
                      }
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                      analysisDepth === 'standard'
                        ? 'border-primary bg-primary/5 shadow-brand'
                        : user
                          ? 'border-border bg-card hover:border-primary/50'
                          : 'border-muted bg-muted/20 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="EyeIcon" size={20} variant="solid" className={user ? "text-primary" : "text-muted-foreground"} />
                      <span className={`font-semibold ${user ? "text-foreground" : "text-muted-foreground"}`}>Standard</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Thorough Document Analysis</p>
                  </button>

                  <button
                    onClick={() => {
                      const isAdmin = user?.email === 'trustscan.ai@gmail.com';
                      if (isAdmin || userCredits > 0) {
                        setAnalysisDepth('deep');
                      } else {
                        setError("You have run out of Deep Scan credits.");
                      }
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                      analysisDepth === 'deep'
                        ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                        : (userCredits > 0 || user?.email === 'trustscan.ai@gmail.com')
                          ? 'border-border bg-card hover:border-indigo-500/50'
                          : 'border-muted bg-muted/20 opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon name="SparklesIcon" size={20} variant="solid" className={userCredits > 0 ? "text-indigo-500" : "text-muted-foreground"} />
                      <span className={`font-semibold ${userCredits > 0 ? "text-foreground" : "text-muted-foreground"}`}>Deep Forensics</span>
                    </div>
                    <p className="text-xs text-muted-foreground">ELA & Pixel Inconsistency</p>
                  </button>
                </div>
              </div>
            </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleScan}
                disabled={isScanning || !canScan()}
                className="flex-[2] flex items-center justify-center space-x-2 px-6 py-4 bg-primary text-primary-foreground rounded-lg font-headline font-semibold hover:bg-trust-blue hover:-translate-y-0.5 hover:shadow-brand transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isScanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Scan...</span>
                  </>
                ) : (
                  <>
                    <Icon name="ShieldCheckIcon" size={24} variant="solid" />
                    <span>{currentScanType?.buttonText || 'Start Security Scan'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClear}
                className="flex-1 px-6 py-4 border-2 border-border rounded-lg font-headline font-semibold text-foreground hover:bg-muted hover:border-primary/50 transition-all duration-300"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-card dark:bg-gradient-to-br dark:from-[#131726] dark:to-[#0F121E] border border-border dark:border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-6 shadow-md dark:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon name="BoltIcon" size={24} variant="solid" className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <h3 className="font-headline font-semibold text-foreground">Instant Results</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Get comprehensive fraud analysis in under 3 seconds with real-time processing</p>
            </div>

            <div className="bg-card dark:bg-gradient-to-br dark:from-[#131726] dark:to-[#0F121E] border border-border dark:border-primary/25 hover:border-primary/50 rounded-xl p-6 shadow-md dark:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-primary/15 border border-primary/30 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon name="ShieldCheckIcon" size={24} variant="solid" className="text-primary" />
                </div>
                <h3 className="font-headline font-semibold text-foreground">99.2% Accuracy</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Deterministic mathematical checksums + Sarvam Vision 3B + Deep Image Forensics</p>
            </div>

            <div className="bg-card dark:bg-gradient-to-br dark:from-[#131726] dark:to-[#0F121E] border border-border dark:border-indigo-500/25 hover:border-indigo-500/50 rounded-xl p-6 shadow-md dark:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 rounded-xl group-hover:scale-105 transition-transform">
                  <Icon name="LockClosedIcon" size={24} variant="solid" className="text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="font-headline font-semibold text-foreground">Secure & Private</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Client-side encryption with zero data retention for private government IDs</p>
            </div>
          </div>
        </div>
      </div>

      <ScanProgress 
        isScanning={isScanning}
        scanResult={scanResult}
        onComplete={() => {}} 
        depth={analysisDepth}
        type={selectedScanType}
        fileName={selectedFile?.name || (currentScanType?.inputType === 'text' ? (textInput.slice(0, 35) || 'Text Input Payload') : (currentScanType?.inputType === 'link' ? (linkInput.slice(0, 35) || 'Web Domain URL') : 'sample_document.pdf'))}
        fileSizeFormatted={selectedFile ? (
          selectedFile.size < 1024 * 1024 
            ? `${(selectedFile.size / 1024).toFixed(1)} KB` 
            : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        ) : '2.4 MB'}
        previewUrl={selectedFile ? URL.createObjectURL(selectedFile) : null}
        onCancel={() => {
          setIsScanning(false);
          setScanResult(null);
        }}
        onReset={() => {
          setIsScanning(false);
          setScanResult(null);
          handleClear();
        }}
      />
      <KeyboardShortcuts onScan={handleScan} onClear={handleClear} />
    </div>
  );
}
