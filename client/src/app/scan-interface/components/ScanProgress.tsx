'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

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

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Calculate estimated duration based on type and depth
  let estimatedDuration = 4000;
  if (type === 'document') {
    if (depth === 'deep') estimatedDuration = 45000;
    else if (depth === 'standard') estimatedDuration = 20000;
    else estimatedDuration = 10000;
  } else if (type === 'link') {
    estimatedDuration = 6000;
  } else if (type === 'company') {
    estimatedDuration = 12000;
  }

  const steps = [
    { label: 'Initializing Pipeline', icon: 'CommandLineIcon' },
    { label: depth === 'deep' ? 'High-Res OCR Rendering' : (type === 'document' ? 'Extracting Text Layer' : 'Analyzing Request'), icon: 'DocumentMagnifyingGlassIcon' },
    { label: 'Analyzing Fraud Signals', icon: 'MagnifyingGlassIcon' },
    { label: 'Risk Classification', icon: 'CpuChipIcon' },
    { label: 'Finalizing Security Report', icon: 'ShieldCheckIcon' },
  ];

  useEffect(() => {
    if (!isScanning || !isHydrated) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const updateInterval = 100;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we reach the end to wait for actual API response
        let increment = (100 / (estimatedDuration / updateInterval));
        
        // If we are past 90%, slow down significantly
        if (prev > 90) {
          increment = 0.5;
        }
        if (prev > 98) {
          increment = 0.05; // Almost stall at 98%
        }

        const newProgress = Math.min(prev + increment, 99.5);
        
        const newStep = Math.floor((newProgress / 100) * steps.length);
        if (newStep !== currentStep && newStep < steps.length) {
          setCurrentStep(newStep);
        }
        
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isScanning, isHydrated, depth, type, steps.length, currentStep]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-brand-elevated p-8 max-w-md w-full border border-primary/20">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4 animate-pulse">
            <Icon name="ShieldCheckIcon" size={48} variant="solid" className="text-primary" />
          </div>
          <h3 className="text-2xl font-headline font-bold text-foreground mb-1">Scanning...</h3>
          <p className="text-sm text-muted-foreground">This may take a moment for {depth === 'deep' ? 'Deep Vision' : 'Standard'} analysis</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">{isHydrated ? Math.round(progress) : 0}% Complete</span>
              <span className="text-primary font-bold animate-pulse">
                {isHydrated ? (progress > 98 ? 'Finalizing...' : `est. ${Math.max(1, Math.ceil(((1 - progress/100) * estimatedDuration) / 1000))}s remaining`) : 'Calculating...'}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out"
                style={{ width: isHydrated ? `${progress}%` : '0%' }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary/10 border border-primary/30'
                    : index < currentStep
                    ? 'bg-success/5 border border-success/20' 
                    : 'bg-muted/30 border border-transparent opacity-50'
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    index === currentStep
                      ? 'text-primary'
                      : index < currentStep
                      ? 'text-success' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <Icon name="CheckCircleIcon" size={24} variant="solid" />
                  ) : (
                    <Icon name={step.icon as any} size={24} variant={index === currentStep ? 'solid' : 'outline'} />
                  )}
                </div>
                <span
                  className={`text-sm font-semibold ${
                    index === currentStep
                      ? 'text-foreground'
                      : index < currentStep
                      ? 'text-success' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {index === currentStep && (
                  <div className="ml-auto">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}