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
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'accepted-all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential-only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-3xl px-2 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-5">
        <div className="flex-grow space-y-2 text-left w-full">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="ShieldCheckIcon" size={20} />
            <h4 className="font-headline font-bold text-base text-foreground">
              Cookie Preferences & Privacy Notice
            </h4>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            TrustScan AI uses essential cookies to ensure secure operations, session integrity, and third-party advertising cookies (including Google AdSense) to keep our verification tools free. Read our{' '}
            <Link href="/privacy-policy" className="text-primary hover:underline font-semibold">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/cookie-policy" className="text-primary hover:underline font-semibold">
              Cookie Policy
            </Link>{' '}
            to learn more.
          </p>
        </div>

        <div className="flex flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleAcceptEssential}
            className="flex-1 md:flex-none px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl hover:bg-muted/60 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-xl shadow-lg hover:shadow-primary/25 hover:opacity-95 transition-all active:scale-95"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
