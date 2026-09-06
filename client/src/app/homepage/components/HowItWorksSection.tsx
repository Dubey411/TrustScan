'use client';

import Icon from '@/components/ui/AppIcon';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      icon: 'ArrowUpTrayIcon',
      title: 'Submit Artifact',
      description: 'Upload an offer letter (PDF/Doc), UPI payment screenshot, image, or paste a CIN/GSTIN number for forensic analysis.',
    },
    {
      number: '02',
      icon: 'CpuChipIcon',
      title: 'Invariant Analysis',
      description: 'Our engine applies deterministic invariant gates: ELA pixel decompression, 2D FFT spectral checks, and official registry cross-validation.',
    },
    {
      number: '03',
      icon: 'ScaleIcon',
      title: 'Calibrated Fusion',
      description: 'Features are fused via empirical logistic calibration (ROC-AUC 0.9175) to prevent train/test leakage and suppress false positives.',
    },
    {
      number: '04',
      icon: 'ShieldCheckIcon',
      title: 'Actionable Verdict',
      description: 'Receive an instant risk score (0-100), red flag forensic breakdowns, and certified proof for dispute handling.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-muted/40 dark:bg-[#0E1017]/80 relative z-10 border-y border-border dark:border-white/[0.04]">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-card dark:bg-[#161922] border border-border text-xs font-mono text-emerald-500 dark:text-[#4ADE80]">
            <span>Verification Pipeline</span>
            <span className="text-muted-foreground">•</span>
            <span>4 Seamless Steps</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-semibold text-foreground tracking-tight">
            How TrustScan AI Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed">
            A sovereign, zero-trust verification pipeline designed for precision, auditability, and speed.
          </p>
        </div>

        {/* 4-Column Step Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="group relative rounded-2xl bg-card dark:bg-[#161922] border border-border dark:border-white/[0.06] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-primary/30 dark:hover:border-white/[0.14] flex flex-col justify-between"
            >
              <div>
                {/* Top Number Badge and Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-muted dark:bg-white/[0.04] border border-border dark:border-white/[0.08] flex items-center justify-center text-primary group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                    <Icon name={step.icon as any} size={24} />
                  </div>
                  <span className="font-mono text-2xl font-bold text-foreground/20 group-hover:text-primary/60 transition-colors">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-headline font-semibold text-foreground tracking-tight mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step indicator line */}
              <div className="pt-6 mt-6 border-t border-border dark:border-white/[0.04] flex items-center gap-2">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === 0
                      ? 'w-full bg-gradient-to-r from-[#FF6B4A] to-[#FF8F73]'
                      : index === 1
                      ? 'w-full bg-gradient-to-r from-[#818CF8] to-[#A5B4FC]'
                      : index === 2
                      ? 'w-full bg-gradient-to-r from-[#FBBF24] to-[#FDE68A]'
                      : 'w-full bg-gradient-to-r from-[#4ADE80] to-[#86EFAC]'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;