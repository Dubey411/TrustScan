'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface CTASectionProps {
  onScanClick?: () => void;
}

const CTASection = ({ onScanClick }: CTASectionProps) => {
  return (
    <section className="py-24 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Dark Gradient Card with Animated Radial Glows */}
        <div className="relative rounded-3xl bg-card dark:bg-gradient-to-br dark:from-[#161922] dark:via-[#1A1D27] dark:to-[#12141C] border border-border overflow-hidden text-center p-10 sm:p-14 lg:p-16 shadow-xl dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
          {/* Animated Radial Glow Layer 1 (10s loop) */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary opacity-10 dark:opacity-20 blur-[100px] animate-cta-glow-1 pointer-events-none"
            style={{ willChange: 'transform' }}
          />

          {/* Animated Radial Glow Layer 2 (12s loop) */}
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary opacity-10 dark:opacity-20 blur-[100px] animate-cta-glow-2 pointer-events-none"
            style={{ willChange: 'transform' }}
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-muted dark:bg-white/[0.05] border border-border text-xs font-mono text-foreground/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Instant AI Verification Access</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-semibold text-foreground tracking-tight leading-tight">
              Start verifying in seconds.
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto leading-relaxed">
              Protect your career and financial transactions from forgery. Instant multi-modal forensic audits with zero data persistence.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/scan-interface"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-base text-white bg-[#FF6B4A] hover:bg-[#FF7A5C] transition-all duration-300 shadow-[0_0_28px_rgba(255,107,74,0.4)] hover:shadow-[0_0_36px_rgba(255,107,74,0.6)] hover:-translate-y-0.5"
              >
                <Icon name="ShieldCheckIcon" size={20} className="text-white" />
                <span>Start Free Scan</span>
              </Link>

              <Link
                href="/pricing-page"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-medium text-base text-foreground bg-muted dark:bg-white/[0.05] hover:bg-muted/80 dark:hover:bg-white/[0.08] border border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>View Enterprise Pricing</span>
                <Icon name="ArrowRightIcon" size={16} className="text-muted-foreground" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-border flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={16} className="text-[#4ADE80]" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={16} className="text-[#4ADE80]" />
                <span>100% Sovereign Privacy</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircleIcon" size={16} className="text-[#4ADE80]" />
                <span>Zero-Retention Verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;