'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ScanProgressProps {
  isScanning: boolean;
  onComplete: () => void;
}

export default function ScanProgress({ isScanning, onComplete }: ScanProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const steps = [
    { label: 'Analyzing content', icon: 'MagnifyingGlassIcon' },
    { label: 'Checking patterns', icon: 'ChartBarIcon' },
    { label: 'Verifying sources', icon: 'ShieldCheckIcon' },
    { label: 'Generating report', icon: 'DocumentTextIcon' },
  ];

  useEffect(() => {
    if (!isScanning || !isHydrated) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const totalDuration = 3000;
    const stepDuration = totalDuration / steps.length;
    const updateInterval = 50;
    const progressIncrement = (100 / totalDuration) * updateInterval;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + progressIncrement, 100);
        
        const newStep = Math.floor((newProgress / 100) * steps.length);
        if (newStep !== currentStep && newStep < steps.length) {
          setCurrentStep(newStep);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500);
        }
        
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isScanning, isHydrated, onComplete]);

  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-brand-elevated p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4 animate-pulse">
            <Icon name="ShieldCheckIcon" size={48} variant="solid" className="text-primary" />
          </div>
          <h3 className="text-2xl font-headline font-bold text-foreground mb-2">Scanning in Progress</h3>
          <p className="text-muted-foreground">Analyzing your content for potential threats...</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">{isHydrated ? Math.round(progress) : 0}% Complete</span>
              <span className="text-muted-foreground">
                {isHydrated ? `~${Math.max(1, Math.ceil((100 - progress) / 33))}s remaining` : '~3s remaining'}
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
                    ? 'bg-primary/10 border-2 border-primary'
                    : index < currentStep
                    ? 'bg-success/10 border-2 border-success' :'bg-muted/30 border-2 border-transparent'
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    index === currentStep
                      ? 'text-primary'
                      : index < currentStep
                      ? 'text-success' :'text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <Icon name="CheckCircleIcon" size={24} variant="solid" />
                  ) : (
                    <Icon name={step.icon as any} size={24} variant={index === currentStep ? 'solid' : 'outline'} />
                  )}
                </div>
                <span
                  className={`font-medium ${
                    index === currentStep
                      ? 'text-foreground'
                      : index < currentStep
                      ? 'text-success' :'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {index === currentStep && (
                  <div className="ml-auto">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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