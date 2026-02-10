'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { performScan, getUserProfile } from '@/api/scan';
import { useAuth } from '@/context/AuthContext';


// Ensure these imports point to the correct relative path
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
  const { user, loading } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  const [selectedScanType, setSelectedScanType] = useState<string>('email');
  const [textInput, setTextInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'standard' | 'deep'>('basic');
  const [priorityLevel, setPriorityLevel] = useState<'normal' | 'urgent'>('normal');
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [isFetchingCredits, setIsFetchingCredits] = useState(false);
  const [senderId, setSenderId] = useState('');
  const [isLinkValid, setIsLinkValid] = useState(true);


  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      if (user?.uid) {
        setIsFetchingCredits(true);
        try {
          const profile = await getUserProfile(user.uid);
          setUserCredits(profile.credits || 0);
        } catch (e) {
          console.error("Failed to fetch credits", e);
        } finally {
          setIsFetchingCredits(false);
        }
      }
    };
    if (isHydrated && user) {
      fetchCredits();
    }
  }, [isHydrated, user]);

  useEffect(() => {
    if (selectedScanType === 'link' || selectedScanType === 'company') {
      setAnalysisDepth(user ? 'standard' : 'basic');
    }
  }, [selectedScanType, user]);


  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const scanTypes: ScanType[] = [
    {
      id: 'email',
      icon: 'EnvelopeIcon',
      title: 'Email/Message Scan',
      description: 'Analyze suspicious emails, UPI fraud messages, or SMS content',
      inputType: 'text',
      placeholder: 'Paste the email, UPI fraud message, or job offer here...',
      maxLength: 5000,
      buttonText: 'Analyze Message'
    },
    {
      id: 'company',
      icon: 'BuildingOffice2Icon',
      title: 'Company Verifier',
      description: 'Validate business legitimacy via GSTIN or CIN Verification Online',
      inputType: 'text',
      placeholder: 'Enter Company Name, GSTIN, or CIN for verification online...',
      maxLength: 500,
      buttonText: 'Verify Entity'
    },
    {
      id: 'link',
      icon: 'LinkIcon',
      title: 'Link/URL Scan',
      description: 'Check if this link is safe and detect phishing attempts',
      inputType: 'link',
      placeholder: 'Enter URL to check "is this link safe"...',
      buttonText: 'Check Link Safety'
    },
    {
      id: 'document',
      icon: 'DocumentIcon',
      title: 'Document Scan',
      description: 'Upload offer letters, contracts, or documents for verification',
      inputType: 'file',
      acceptedFormats: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
      maxSize: 10 * 1024 * 1024,
      buttonText: 'Scan Document'
    },
];

  const currentScanType = scanTypes.find((type) => type.id === selectedScanType);

  const canScan = (): boolean => {
    if (!currentScanType) return false;
    
    switch (currentScanType.inputType) {
      case 'text':
        return textInput.trim().length > 10;
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
    
    // Guests can scan, but history won't be saved to DB
    setIsScanning(true);
    setError(null);



    // Determine target/content
    let targetContent = '';
    if (currentScanType?.inputType === 'text') {
        targetContent = textInput;
    } else if (currentScanType?.inputType === 'link') {
        targetContent = linkInput;
    } else {
        // Fallback for file/other (mock for now as API handles text)
        targetContent = selectedFile ? selectedFile.name : 'Unknown File';
    }

    try {
        // Call API - Using Firebase UID for persistent history
        const scanData: any = { 
            type: selectedScanType, 
            userId: user?.uid || undefined,
            depth: analysisDepth,
            senderId: senderId || undefined
        };

        // Optional: Location tagging for the Fraud Map
        try {
            if (analysisDepth === 'deep' && "geolocation" in navigator) {
                // We'll just tag it with a placeholder or prompt later
                // scanData.location = { city: "Detecting..." }; 
            }
        } catch (e) { /* ignore location errors */ }



        if (selectedFile && selectedScanType === 'document') {
            scanData.file = selectedFile;
        } else {
            scanData.content = targetContent;
        }

        const result = await performScan(scanData);

        
        // Pass result to parent
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

      if (onScanComplete) {
          onScanComplete({
              id: (result as any).id || (result as any)._id,
              type: selectedScanType,
              target: targetContent.slice(0, 50) + (targetContent.length > 50 ? '...' : ''),
              apiResult: result // Pass the full API result
          });
      } else {
          // If no callback, and we have a result, store it and move to results page
          localStorage.setItem('latestScan', JSON.stringify({
             id: (result as any).id || (result as any)._id,
             type: selectedScanType,
             target: targetContent,
             apiResult: result
          }));
          router.push('/results-dashboard');
      }
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
    setError(null);
  };


  return (
    <>
      {/* Header Removed for Dashboard Integration */}
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-foreground mb-6 leading-tight">
                  India's Smartest AI <span className="text-primary italic">Fraud Detection</span> Engine
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Perform a <strong>fake job offer check</strong>, scan for <strong>UPI fraud messages</strong>, do <strong>CIN verification online</strong>, and check <strong>is this link safe</strong> instantly with 98.7% accuracy.
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

            <div className="bg-card rounded-xl shadow-brand p-6 md:p-8 mb-8">
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
                  content="Paste or upload the content you want to verify. Our AI will analyze it for fraud indicators and provide a detailed safety report."
                  position="left"
                />
              </div>

              <div className="mb-6">
                {currentScanType?.inputType === 'text' && (
                  selectedScanType === 'company' ? (
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
                  ) : (
                    <div className="space-y-4">
                      {selectedScanType === 'email' && (
                         <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                            <div className="flex items-center gap-2 mb-3">
                               <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Optional: SMS Header / Sender ID</span>
                               <HelpTooltip content="For Indian SMS (e.g., VM-HDFCBK). Helps detect header spoofing/masking scams." />
                            </div>
                            <input
                               type="text"
                               value={senderId}
                               onChange={(e) => setSenderId(e.target.value)}
                               placeholder="e.g. AD-SBINB, VM-HDFCBK"
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') handleScan();
                               }}
                               className="w-full md:w-64 p-3 bg-background text-foreground border border-border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                         </div>
                      )}
                      <TextInputArea
                        value={textInput}
                        onChange={setTextInput}
                        placeholder={currentScanType.placeholder || ''}
                        maxLength={currentScanType.maxLength || 5000}
                        onScan={handleScan}
                      />
                    </div>
                  )
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
                    maxSize={currentScanType.maxSize || 10 * 1024 * 1024}
                  />
                )}
              </div>

              {selectedScanType !== 'link' && selectedScanType !== 'company' && (
              <div className="hidden md:block mb-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-headline font-semibold text-foreground">Analysis Depth</h3>
                    {user && (
                      <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                        {userCredits} Credits Available
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
                      <p className="text-xs text-muted-foreground">Quick scan (Top pages)</p>
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
                      <div className="absolute -top-3 -right-3 z-10 flex gap-1">
                        {!user && (
                          <span className="bg-muted-foreground text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="EyeIcon" size={20} variant="solid" className={user ? "text-primary" : "text-muted-foreground"} />
                        <span className={`font-semibold ${user ? "text-foreground" : "text-muted-foreground"}`}>Standard</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Thorough analysis</p>
                      
                      {!user && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-xl">
                          <span className="text-[10px] font-bold text-primary uppercase">Login to Unlock</span>
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (userCredits > 0) {
                          setAnalysisDepth('deep');
                        } else {
                          router.push('/pricing-page');
                        }
                      }}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left group ${
                        analysisDepth === 'deep'
                          ? 'border-primary bg-primary/5 shadow-brand'
                          : userCredits > 0 
                            ? 'border-border bg-card hover:border-primary/50'
                            : 'border-muted bg-muted/20 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="absolute -top-3 -right-3 z-10 flex gap-1">
                        {userCredits > 0 ? (
                           <span className="bg-success text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm tracking-widest animate-pulse">
                            PREMIUM
                          </span>
                        ) : (
                          <span className="bg-muted-foreground text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                            LOCKED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon name="BeakerIcon" size={20} variant="solid" className={userCredits > 0 ? "text-primary" : "text-muted-foreground"} />
                        <span className={`font-semibold ${userCredits > 0 ? "text-foreground" : "text-muted-foreground"}`}>Deep Scan</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Premium 10+ Page Search</p>
                      
                      {/* Tooltip on hover if locked */}
                      {userCredits === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-xl">
                          <span className="text-[10px] font-bold text-primary uppercase">Buy Credits</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-headline font-semibold text-foreground mb-3">Priority Level</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        priorityLevel === 'normal'
                          ? 'border-primary bg-primary/5 shadow-brand'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                      onClick={() => setPriorityLevel('normal')}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name="ClockIcon" size={20} variant="solid" className="text-primary" />
                        <span className="font-semibold text-foreground">Normal</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => router.push('/pricing-page')}
                      className="relative p-4 rounded-xl border-2 border-amber-200/30 bg-amber-50/30 transition-all duration-300 text-left group hover:bg-amber-100/50 border-dashed"
                    >
                      <div className="absolute -top-3 -right-3 z-10">
                         <span className="bg-amber-400 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider">
                          pro
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name="BoltIcon" size={20} variant="solid" className="text-amber-500" />
                          <span className="font-semibold text-foreground">Urgent</span>
                        </div>
                        <Icon name="LockClosedIcon" size={16} variant="solid" className="text-amber-500/50" />
                      </div>
                    </button>
                  </div>
                </div>

                 <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3">
                  <Icon name="InformationCircleIcon" size={18} variant="solid" className="text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Logged-in users get 3 free Deep Scans monthly. For unlimited 10+ page analysis, upgrade to Pro.
                  </p>
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

                {/* Mobile Specific Deep Verify Button */}
                {selectedScanType !== 'link' && selectedScanType !== 'company' && (
                <button 
                  onClick={() => router.push('/pricing-page')}
                  className="md:hidden flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-amber-500 text-white rounded-lg font-headline font-semibold hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <Icon name="BeakerIcon" size={20} variant="solid" />
                  <span>Deep Verify</span>
                </button>
                )}

                <button
                  onClick={handleClear}
                  className="flex-1 px-6 py-4 border-2 border-border rounded-lg font-headline font-semibold text-foreground hover:bg-muted hover:border-primary/50 transition-all duration-300"
                >
                  Clear
                </button>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start space-x-3">
                  <Icon name="InformationCircleIcon" size={20} variant="solid" className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">What we check:</p>
                    <ul className="space-y-1">
                      <li>• Suspicious language patterns and urgency tactics</li>
                      <li>• Company verification and domain authenticity</li>
                      <li>• Known scam databases and fraud indicators</li>
                      <li>• Contact information and payment request analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Icon name="BoltIcon" size={24} variant="solid" className="text-success" />
                  </div>
                  <h3 className="font-headline font-semibold text-foreground">Instant Results</h3>
                </div>
                <p className="text-sm text-muted-foreground">Get comprehensive fraud analysis in under 3 seconds with real-time processing</p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon name="ShieldCheckIcon" size={24} variant="solid" className="text-primary" />
                  </div>
                  <h3 className="font-headline font-semibold text-foreground">95%+ Accuracy</h3>
                </div>
                <p className="text-sm text-muted-foreground">AI-powered detection trained on thousands of verified scam patterns</p>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-subtle">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Icon name="LockClosedIcon" size={24} variant="solid" className="text-secondary" />
                  </div>
                  <h3 className="font-headline font-semibold text-foreground">Secure & Private</h3>
                </div>
                <p className="text-sm text-muted-foreground">End-to-end encryption with zero data sharing to third parties</p>
              </div>
            </div>
          </div>
      {/* </div>
      </div> */}

      <ScanProgress 
        isScanning={isScanning} 
        onComplete={() => {}} 
        depth={analysisDepth}
        type={selectedScanType}
      />
      <KeyboardShortcuts onScan={handleScan} onClear={handleClear} />
    </>
  );
}