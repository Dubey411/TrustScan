import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import ScanInterfaceInteractive from '../scan-interface/components/ScanInterfaceInteractive';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fake Offer Letter Check Online Free | Job Offer Verification & Stamp Tamper Audit - TrustScan AI',
  description: 'Free online tool to verify job offer letters and appointment letters. Detect forged corporate seals, verify 21-digit MCA CIN numbers, check HR email domain authenticity, and audit salary CTC math for TCS, Infosys, Wipro, and Indian startups.',
  alternates: {
    canonical: 'https://www.trustscanai.in/offer-letter-verification',
  },
  openGraph: {
    title: 'Fake Offer Letter Check Online Free | Job Offer Verification & Forensic Stamp Audit',
    description: 'Upload your job offer letter PDF or image to inspect for fake training fees, altered corporate stamps, unregistered MCA CINs, and recruitment scams.',
    url: 'https://www.trustscanai.in/offer-letter-verification',
    siteName: 'TrustScan AI',
    type: 'website',
    images: [
      {
        url: 'https://www.trustscanai.in/image.png',
        width: 1200,
        height: 630,
        alt: 'TrustScan AI Offer Letter Verification Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fake Offer Letter Check Online Free | TrustScan AI',
    description: 'Instant forensic verification for job offer letters in India. Stop recruitment scams before paying fake training deposits.',
    images: ['https://www.trustscanai.in/image.png'],
  },
  keywords: [
    'offer letter check online',
    'fake offer letter check online free',
    'job offer letter check online free',
    'fake offer letter detection pdf',
    'check offer letter online',
    'tcs offer letter verification online free',
    'infosys fake offer letter check',
    'wipro appointment letter verification',
    'how to check fake offer letter online',
    'fake job scam detector India',
    'company seal tamper detector',
    'TrustScan AI offer letter verification',
  ],
};

export default function OfferLetterVerificationPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I check if a job offer letter is genuine or fake online for free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You can upload your offer letter PDF or image to TrustScan AI. Our multi-vector forensic engine checks 4 critical factors in under 10 seconds: (1) Demands for security or laptop deposits (legitimate Indian employers never charge candidates), (2) Ministry of Corporate Affairs (MCA) 21-digit CIN registration status, (3) Pixel-level Error Level Analysis (ELA) for copy-pasted blue ink stamps, and (4) HR email domain validation.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do companies like TCS, Infosys, Wipro, or Cognizant ever charge training or laptop fees?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Major Indian IT companies like Tata Consultancy Services (TCS), Infosys, Wipro, and Cognizant maintain strict public zero-fee hiring policies. Any offer letter or HR representative demanding money for "laptop insurance", "medical tests", "mandatory onboarding certificates", or "portal activation" is an outright recruitment scam.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does TrustScan AI detect forged stamps and signatures on offer letters?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Scammers frequently lift genuine company stamps from internet PDFs and paste them onto fraudulent appointment letters using photo editing software. TrustScan AI uses Error Level Analysis (ELA) and Fourier transform frequency spectra to identify compression gradient anomalies and edge aliasing mismatches between the pasted stamp and the underlying document paper.',
        },
      },
      {
        '@type': 'Question',
        name: 'What should I do if an offer letter arrives from a Gmail or Telegram handle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Genuine corporate recruitment strictly originates from corporate domains (e.g., @tcs.com or @infosys.com). If a recruiter contacts you from a generic @gmail.com address, WhatsApp business profile, or invites you to a Telegram channel for an interview, it is a high-risk impersonation scheme. TrustScan AI scans sender domains and contact channels against cyber threat intelligence patterns.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.trustscanai.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Offer Letter Verification',
        item: 'https://www.trustscanai.in/offer-letter-verification',
      },
    ],
  };

  const capabilities = [
    {
      title: 'Zero-Fee Policy Audit',
      desc: 'Flags suspicious demands for laptop security deposits, onboarding kits, training fees, or document clearance fees which are strictly prohibited by legitimate employers.',
      icon: 'CurrencyRupeeIcon',
      badge: 'Financial Signal',
    },
    {
      title: 'Corporate CIN Cross-Reference',
      desc: 'Extracts and decodes the 21-digit Corporate Identity Number (CIN) against the Ministry of Corporate Affairs (MCA) database to verify legal incorporation status.',
      icon: 'BuildingOffice2Icon',
      badge: 'MCA Registry',
    },
    {
      title: 'Forged Stamp & Seal Forensics',
      desc: 'Applies pixel-level Error Level Analysis (ELA) to detect copied-and-pasted blue ink registrar stamps, recolored graphics, and forged executive signatures.',
      icon: 'ShieldCheckIcon',
      badge: 'Visual Heuristics',
    },
    {
      title: 'HR Domain & Impersonation Audit',
      desc: 'Inspects email headers, communication channels, and contact details to expose personal @gmail.com addresses, unofficial webmail, and fraudulent Telegram recruiters.',
      icon: 'EnvelopeIcon',
      badge: 'Domain Intel',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-3">
              Recruitment Fraud Defense
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4 tracking-tight">
              Fake Offer Letter Check Online Free
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Verify your job offer letter or appointment contract in seconds. Inspect for forged corporate stamps, fake security deposit clauses, invalid MCA CIN registrations, and recruitment scams.
            </p>
          </div>

          {/* Interactive Scanner Pre-Selected to 'document' */}
          <div className="mb-20">
            <ScanInterfaceInteractive initialScanType="document" />
          </div>

          {/* Technical Capabilities Grid */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold text-foreground mb-3">
                Comprehensive 4-Layer Offer Letter Forensics
              </h2>
              <p className="text-muted-foreground text-sm md:text-base">
                How TrustScan AI identifies sophisticated fake recruitment documents and protects candidates before money is lost.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {capabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-2xl p-6 md:p-8 hover:border-primary/40 transition-colors shadow-subtle space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon name={item.icon as any} size={22} />
                    </div>
                    <span className="text-xs font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-headline font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Guide Section */}
          <div className="max-w-4xl mx-auto bg-muted/40 border border-border rounded-3xl p-8 md:p-12 mb-20 space-y-8">
            <div>
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Candidate Security Protocol</span>
              <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground mt-1 mb-4">
                The 3 Critical Red Flags in Counterfeit Appointment Letters
              </h2>
              <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                <p>
                  <strong>1. Demand for Refundable Fees:</strong> Scammers often use convincing official language claiming that a deposit of ₹2,500 to ₹12,000 is required for "laptop courier courier charges", "anti-cheat software licensing", or "medical clearances". Legitimate Indian corporations absorb all onboarding costs.
                </p>
                <p>
                  <strong>2. Generic Webmail Contacts:</strong> Scammers may claim to be "Senior Talent Acquisition Partners" at Infosys or TCS, but provide contact emails like <code>infosys.recruitment.india@gmail.com</code> or ask you to message an HR executive on Telegram.
                </p>
                <p>
                  <strong>3. Unmatched MCA Corporate Records:</strong> Every legitimate company in India possesses an active 21-digit Corporate Identification Number (CIN). Counterfeiters frequently invent non-existent numbers or borrow CINs of dissolved shell firms.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl font-bold font-mono text-primary mb-1">0 Fee</div>
                <div className="text-xs text-muted-foreground">Free for Students & Job Seekers</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl font-bold font-mono text-emerald-500 mb-1">100% Private</div>
                <div className="text-xs text-muted-foreground">End-to-End Encrypted Inspection</div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-2xl font-bold font-mono text-purple-500 mb-1">10 Seconds</div>
                <div className="text-xs text-muted-foreground">Instant Multi-Signal Forensic Report</div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-headline font-bold text-foreground mb-6 text-center">
              Frequently Asked Questions About Offer Letter Verification
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((faq, idx) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-subtle">
                  <h3 className="text-lg font-headline font-bold text-foreground mb-2">{faq.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-linking CTA */}
          <div className="text-center bg-card border border-border rounded-3xl p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-headline font-bold text-foreground mb-2">
              Also Verifying Supporting Documents or Screenshots?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Inspect suspicious corporate identity documents, verify company MCA registrations, or audit digital payment receipts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/company-verification"
                className="px-6 py-2.5 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Verify Company & CIN →
              </Link>
              <Link
                href="/image-verification"
                className="px-6 py-2.5 bg-muted border border-border text-foreground text-xs md:text-sm font-semibold rounded-xl hover:bg-muted/80 transition-colors"
              >
                AI Image & Stamp Tamper Checker →
              </Link>
              <Link
                href="/payment-verification"
                className="px-6 py-2.5 bg-muted border border-border text-foreground text-xs md:text-sm font-semibold rounded-xl hover:bg-muted/80 transition-colors"
              >
                UPI Payment Forensics →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
