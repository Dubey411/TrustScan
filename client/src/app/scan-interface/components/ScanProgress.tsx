'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import ScanGame from './ScanGame';

interface ScanProgressProps {
  isScanning: boolean;
  onComplete: () => void;
  depth?: 'basic' | 'standard' | 'deep';
  type?: string;
}

export default function ScanProgress({ isScanning, onComplete, depth = 'basic', type = 'message' }: ScanProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Duration mapping
  const getDuration = () => {
    if (type === 'document') {
      return depth === 'deep' ? 35000 : (depth === 'standard' ? 15000 : 8000);
    }
    if (type === 'company') return 12000;
    if (type === 'link') return 10000;
    return 6000;
  };

  const estimatedDuration = getDuration();

  const steps = [
    { label: 'Initializing Neural Pipeline', icon: 'CommandLineIcon', log: 'Starting core engine v4.2...' },
    { label: type === 'document' ? 'OCR Layer Reconstruction' : 'Decrypting Payload Structure', icon: 'CpuChipIcon', log: 'Extracting metadata vectors...' },
    { label: 'Signal Context Matching', icon: 'MagnifyingGlassIcon', log: 'Consulting global fraud database (98% hitrate)...' },
    { label: 'Risk Vector Classification', icon: 'ShieldExclamationIcon', log: 'Running logic gates on 248 signals...' },
    { label: 'Generating Security Report', icon: 'DocumentTextIcon', log: 'Compiling final forensic verdict...' },
  ];

  const auditLogPool = [
    "Analyzing IP reputation masks...",
    "Validating CIN checksum strings...",
    "Scanning for urgency-based NLP patterns...",
    "Checking domain registration history...",
    "Tracing redirect chains (hop count: 3)...",
    "Identifying AI-generated linguistics...",
    "Matching brand identity against whitelist...",
    "Verifying RBI-regulated headers...",
    "Measuring structural entropy...",
    "Cross-referencing leaked databases...",
    "Running Tesseract OCR engine...",
    "Normalizing case-insensitive content...",
    "Detecting punycode deception..."
  ];

  useEffect(() => {
    if (!isScanning || !isHydrated) {
      setProgress(0);
      setCurrentStep(0);
      setLogs([]);
      return;
    }

    // Progress Engine
    const updateInterval = 80;
    const interval = setInterval(() => {
      setProgress((prev) => {
        let increment = (100 / (estimatedDuration / updateInterval));
        if (prev > 85) increment = 0.3;
        if (prev > 95) increment = 0.05;
        if (prev > 99) return 99;

        const next = prev + increment;
        const stepIndex = Math.floor((next / 100) * steps.length);
        if (stepIndex > currentStep && stepIndex < steps.length) {
          setCurrentStep(stepIndex);
          setLogs(l => [...l.slice(-7), steps[stepIndex].log]);
        }
        return next;
      });
    }, updateInterval);

    // Simulated Log Engine
    const logInterval = setInterval(() => {
      if (Math.random() > 0.4) {
        const randomLog = auditLogPool[Math.floor(Math.random() * auditLogPool.length)];
        setLogs(l => [...l.slice(-7), `> ${randomLog}`]);
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(logInterval);
    };
  }, [isScanning, isHydrated, currentStep, estimatedDuration, type]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-background/90 backdrop-blur-md">
      {/* Background Animated Circuits (SVG) - Fixed position */}
      <div className="fixed inset-0 opacity-10 pointer-events-none overflow-hidden">
         <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
               <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
               </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
         </svg>
      </div>

      <div className="flex min-h-full items-center justify-center p-4 py-8">
        <div className="relative bg-card rounded-3xl shadow-2xl p-6 md:p-10 max-w-2xl w-full border border-primary/20 overflow-hidden transform animate-in fade-in zoom-in duration-500 my-auto">
          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 h-1.5 bg-muted w-full">
             <div 
               className="h-full bg-gradient-to-r from-primary via-blue-400 to-success transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
               style={{ width: `${progress}%` }}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Left Side: Rich Animation */}
            <div className="flex flex-col items-center justify-center text-center">
               <div className="relative w-48 h-48 mb-6">
                  {/* Outer Ring */}
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full border-t-primary animate-spin-slow" />
                  
                  {/* Floating Document Layers (File Creation Animation) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative flex items-center justify-center">
                         {/* Layer 3 (Back) */}
                         <div className="absolute w-24 h-32 bg-primary/10 rounded-lg transform rotate-12 -translate-x-4 -translate-y-4 animate-bounce" style={{ animationDuration: '3s' }} />
                         {/* Layer 2 (Middle) */}
                         <div className="absolute w-24 h-32 bg-primary/30 rounded-lg transform -rotate-6 translate-x-2 translate-y-2 animate-bounce" style={{ animationDuration: '4s', animationDelay: '500ms' }} />
                         
                         {/* Top Active Layer (Representing the scanning file) */}
                         <div className="relative w-28 h-36 bg-card border-2 border-primary/60 rounded-xl flex flex-col p-4 shadow-2xl overflow-hidden animate-pulse">
                            {/* Inner Header */}
                            <div className="h-2 w-1/2 bg-primary/20 rounded-full mb-3" />
                            <div className="h-1.5 w-full bg-muted rounded-full mb-2" />
                            <div className="h-1.5 w-3/4 bg-muted rounded-full mb-6" />
                            
                            {/* Content Sim */}
                            <div className="space-y-2">
                               <div className="h-1 w-full bg-primary/10 rounded-full" />
                               <div className="h-1 w-full bg-primary/10 rounded-full" />
                               <div className="h-1 w-2/3 bg-primary/10 rounded-full" />
                            </div>

                            {/* Secure Badge Icon */}
                            <div className="mt-auto ml-auto">
                                <div className="p-1 px-2 bg-success/20 rounded-md">
                                   <div className="w-4 h-1.5 bg-success/60 rounded-full" />
                                </div>
                            </div>
                            
                            {/* Laser Scanning Beam (Fixed in CSS) */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/40 blur-[3px] animate-scan z-10" />
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/80 z-20 animate-scan" />
                         </div>
                      </div>
                  </div>
               </div>
               
               <h3 className="text-2xl font-headline font-bold text-foreground mb-2">Analyzing Vectors</h3>
               <div className="flex items-center gap-2 text-primary font-accent text-sm mb-4">
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                  {Math.round(progress)}% Processed
               </div>
               
               <p className="text-xs text-muted-foreground bg-muted/60 px-4 py-2 rounded-full border border-border/50 italic font-medium">
                  {estimatedDuration > 20000 ? "Multi-layer Deep Scan requires additional cycles" : "Real-time Pattern Matching Active"}
               </p>
            </div>

            {/* Right Side: Audit Trace & Steps */}
            <div className="flex flex-col space-y-6">
               <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${index > currentStep ? 'opacity-20 translate-x-2' : 'opacity-100 translate-x-0'}`}>
                       <div className={`p-2 rounded-lg transition-colors duration-300 ${index === currentStep ? 'bg-primary text-white shadow-lg animate-pulse' : index < currentStep ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                          <Icon name={index < currentStep ? 'CheckCircleIcon' : (step.icon as any)} size={18} variant="solid" />
                       </div>
                       <span className={`text-sm font-semibold tracking-wide ${index === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                       </span>
                    </div>
                  ))}
               </div>

               {/* Live Audit Log replaced by Mini Game */}
               <ScanGame />

               <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">ETA: <span className="text-foreground">{Math.ceil(((1 - progress/100) * estimatedDuration) / 1000)}s</span></span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                     TRUSTSCAN V4.2
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
