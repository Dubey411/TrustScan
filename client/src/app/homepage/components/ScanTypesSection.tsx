'use client';

import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

interface ScanTypesSectionProps {
  onScanSelect?: (scanType: string) => void;
}

const ScanTypesSection = ({ onScanSelect }: ScanTypesSectionProps) => {
  const scanTypes = [
    {
      id: 'payment',
      title: 'UPI & Payment Fraud Forensics',
      accentColor: '#FF6B4A',
      accentBorderClass: 'hover:border-t-[#FF6B4A]',
      iconBg: 'bg-[#FF6B4A]/10 text-[#FF6B4A] border-[#FF6B4A]/25',
      iconName: 'CreditCardIcon',
      description: 'Audit transaction screenshots, UPI payment receipts, and banking transfers for fake APK generators and altered ₹ amounts.',
      features: [
        '12-digit NPCI UTR reference & sequence audit',
        'Fake payment APK layout & typography signatures',
        'Pixel-level ELA tampering on amounts & timestamps',
        'Bank IFSC code & UPI VPA handle resolver',
      ],
      linkText: 'Try payment scan',
    },
    {
      id: 'company',
      title: 'Company & CIN Verification',
      accentColor: '#818CF8',
      accentBorderClass: 'hover:border-t-[#818CF8]',
      iconBg: 'bg-[#818CF8]/10 text-[#818CF8] border-[#818CF8]/25',
      iconName: 'BuildingOffice2Icon',
      description: 'Verify corporate legitimacy using official MCA Corporate Identity Numbers (CIN), 15-digit GSTIN, and active company filings.',
      features: [
        'CIN 21-digit MCA structure & state-code audit',
        'GSTIN state & checksum algorithm validation',
        'Active registration status & incorporation date check',
        'Official MCA corporate registry cross-referencing',
      ],
      linkText: 'Try company scan',
    },
    {
      id: 'document',
      title: 'Offer Letter & CTC Audit',
      accentColor: '#FBBF24',
      accentBorderClass: 'hover:border-t-[#FBBF24]',
      iconBg: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/25',
      iconName: 'DocumentCheckIcon',
      description: 'Audit employment offer letters and experience certificates for forged letterheads, salary math anomalies, and spoofed HR domains.',
      features: [
        'Salary/stipend benchmark check & math audit',
        'HR email domain & corporate registrar verification',
        'Font alignment & digital Photoshop artifact detection',
        'Security deposit fee & advance recruitment fraud detection',
      ],
      linkText: 'Try offer scan',
    },
    {
      id: 'image',
      title: 'AI Image Detection & Forensics',
      accentColor: '#4ADE80',
      accentBorderClass: 'hover:border-t-[#4ADE80]',
      iconBg: 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/25',
      iconName: 'PhotoIcon',
      description: 'Detect AI-generated images (Stable Diffusion, Midjourney, DALL-E, FLUX) and pixel-level tampering with calibrated confidence.',
      features: [
        '2D FFT high-frequency spectral fingerprinting',
        'Stable Diffusion & Midjourney prompt metadata scanner',
        'Error Level Analysis (ELA) pixel compression map',
        'Empirical logistic regression fusion (ROC-AUC 0.9175)',
      ],
      linkText: 'Try image scan',
    },
  ];

  return (
    <section id="capabilities" className="py-24 relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#161922] border border-white/[0.08] text-xs font-mono text-[#818CF8]">
            <span>Capabilities</span>
            <span className="text-muted-foreground">•</span>
            <span>4 Specialized Engines</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-semibold text-white tracking-tight">
            Specialized Forensic Engines
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-body leading-relaxed">
            Multi-modal verification tailored for Indian regulatory documents, financial receipts, corporate registries, and generative media.
          </p>
        </div>

        {/* 2x2 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {scanTypes.map((type) => (
            <div
              key={type.id}
              className={`group relative rounded-2xl bg-[#161922] border border-white/[0.06] border-t-2 border-t-transparent ${type.accentBorderClass} p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:border-white/[0.12] flex flex-col justify-between`}
            >
              <div>
                {/* Header with Icon & Title */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${type.iconBg} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon name={type.iconName as any} size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-headline font-semibold text-white tracking-tight group-hover:text-white transition-colors">
                      {type.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
                  {type.description}
                </p>

                {/* Green Dot Bulbed Feature List */}
                <div className="space-y-3 mb-8">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] mt-1.5 flex-shrink-0 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                      <span className="text-xs sm:text-sm text-foreground/90 font-body">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Try this scan Link */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <Link
                  href="/scan-interface"
                  className="inline-flex items-center gap-2 text-sm font-semibold font-mono text-[#FF6B4A] hover:text-[#FFA085] transition-colors group/link"
                >
                  <span>{type.linkText}</span>
                  <span className="transform group-hover/link:translate-x-1.5 transition-transform duration-200">
                    →
                  </span>
                </Link>
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                  Instant Output
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScanTypesSection;