'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex-grow space-y-2">
            <div className="flex items-center gap-2 text-primary">
                <Icon name="ShieldCheckIcon" size={20} />
                <h4 className="font-headline font-bold text-base">Privacy & Safety Check</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                TrustScan uses limited cookies to ensure security and improve our AI. Your scan data is never shared with third parties. Read our <Link href="/privacy-policy" className="text-primary hover:underline font-bold">Privacy Policy</Link> for details.
            </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
                onClick={handleAccept}
                className="flex-1 md:flex-none px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
                Secure Access
            </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
