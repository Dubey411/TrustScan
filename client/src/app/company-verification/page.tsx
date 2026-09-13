import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import ScanInterfaceInteractive from '../scan-interface/components/ScanInterfaceInteractive';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Company Verification Online MCA | Check CIN & Fake Company Status India - TrustScan AI',
  description: 'Free online tool to verify Indian company registration, 21-digit Corporate Identity Number (CIN), active GSTIN, and Registrar of Companies (ROC) status under the Ministry of Corporate Affairs (MCA).',
  alternates: {
    canonical: '/company-verification',
  },
  openGraph: {
    title: 'Company Verification Online MCA | Check CIN & Business Legitimacy',
    description: 'Verify if a recruiting company is officially registered in India. Check MCA database records, 21-digit CIN, active director details, and registered office addresses instantly.',
    url: 'https://www.trustscanai.in/company-verification',
    siteName: 'TrustScan AI',
    type: 'website',
  },
  keywords: [
    'company verification online MCA',
    'check CIN number online free',
    'fake company check India',
    'verify company registration status',
    'how to check if company is real or fake',
    'MCA corporate search India',
    'ROC company lookup online',
    'private limited company verification free',
    'GSTIN business verification',
    'TrustScan AI company check',
  ],
};

export default function CompanyVerificationPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I check if a company is legally registered in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every legitimate registered company in India must have a 21-digit Corporate Identification Number (CIN) issued by the Ministry of Corporate Affairs (MCA). You can search the company name or 21-digit CIN on TrustScan AI or the official MCA portal (mca.gov.in) to verify incorporation date, registered office, and active status.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does a 21-digit MCA Corporate Identity Number (CIN) mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A CIN has 6 distinct parts: Listing Status (L for Listed, U for Unlisted), 5-digit Industry Code (NIC code), 2-letter State Code (e.g. MH for Maharashtra), 4-digit Year of Incorporation (e.g. 2021), 3-letter Company Type (e.g. PTC for Private Limited), and 6-digit Registration Sequence Number.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can a fake company print a real company’s CIN on their offer letter?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Scammers frequently copy legitimate CINs from genuine companies. That is why TrustScan AI cross-references the registered office address, company email domain, and state code against the official MCA registry to detect impersonation.',
        },
      },
    ],
  };

  const cinBreakdown = [
    { code: 'U', label: 'Listing Status', desc: 'U = Unlisted Company, L = Publicly Listed on Stock Exchanges' },
    { code: '72900', label: 'Industry Code', desc: '5-digit National Industrial Classification (NIC) code identifying the business sector' },
    { code: 'MH', label: 'State Code', desc: '2-letter state abbreviation of the Registrar of Companies (e.g., MH = Maharashtra, KA = Karnataka)' },
    { code: '2021', label: 'Incorporation Year', desc: 'The exact calendar year the entity was incorporated with the Registrar of Companies' },
    { code: 'PTC', label: 'Company Class', desc: 'PTC = Private Limited, PLC = Public Limited, FTC = Foreign Company subsidiary' },
    { code: '123456', label: 'Registration No.', desc: '6-digit unique sequential identification number assigned by the regional ROC office' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-grow pt-28 pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-3">
              Ministry of Corporate Affairs Verification
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4 tracking-tight">
              Company & CIN Legitimacy Checker
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Verify any Indian company before accepting job offers, making vendor advances, or signing partnership agreements. Check active MCA incorporation records, 21-digit CIN, and registered corporate addresses.
            </p>
          </div>

          {/* Interactive Scanner Pre-Selected to 'company' */}
          <div className="mb-20">
            <ScanInterfaceInteractive initialScanType="company" />
          </div>

          {/* CIN Anatomy Breakdown */}
          <div className="max-w-5xl mx-auto mb-20 bg-muted/40 border border-border rounded-3xl p-8 md:p-12 shadow-subtle">
            <div className="text-center mb-10">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">Educational Manual</span>
              <h2 className="text-3xl font-headline font-bold text-foreground mt-1 mb-3">
                How to Decode a 21-Digit Indian CIN
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
                Every genuine company incorporated in India is assigned an immutable 21-character CIN. Scammers often fabricate random numbers that fail these structural rules.
              </p>
            </div>

            {/* Visual Example Pill */}
            <div className="bg-card border border-border p-4 rounded-2xl mb-8 flex flex-wrap items-center justify-center gap-2 font-mono font-bold text-base md:text-lg">
              <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">U</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">72900</span>
              <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">MH</span>
              <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">2021</span>
              <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">PTC</span>
              <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">123456</span>
            </div>

            {/* Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cinBreakdown.map((part, idx) => (
                <div key={idx} className="bg-card p-5 rounded-xl border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                      Sample: {part.code}
                    </span>
                    <span className="text-xs font-bold text-foreground/80">{part.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">{part.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags in Fake Companies */}
          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-foreground mb-6 text-center">
              Top 4 Corporate Impersonation Red Flags in India
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: '1. CIN State Mismatch',
                  desc: 'The offer letter cites an office in Bengaluru, Karnataka, but the CIN shows "MH" (Maharashtra) with an unrelated registered ROC office address.',
                  icon: 'MapPinIcon',
                },
                {
                  title: '2. "Strike-Off" or Defunct Status',
                  desc: 'The entity was officially struck off or liquidated by the Registrar of Companies due to non-filing of annual balances, yet scammers continue using its brand.',
                  icon: 'NoSymbolIcon',
                },
                {
                  title: '3. Free Webmail on Official Letterhead',
                  desc: 'Legitimate Private Limited entities never use "@gmail.com" or "@outlook.com" for official HR correspondence; all communications must originate from verified domains.',
                  icon: 'EnvelopeIcon',
                },
                {
                  title: '4. Fabricated GSTIN Format',
                  desc: 'A GSTIN must match the state code digits (e.g. 27 for Maharashtra, 29 for Karnataka) matching the first two letters of the company PAN card.',
                  icon: 'DocumentCheckIcon',
                },
              ].map((rf, idx) => (
                <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-subtle flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
                    <Icon name={rf.icon as any} size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-headline font-bold text-foreground mb-1">{rf.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rf.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-headline font-bold text-foreground mb-6 text-center">
              Frequently Asked Questions About Company Verification
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
              Have a Document, Photo, or Seal to Forensically Examine?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Run our multi-modal AI Vision scanner to detect manipulated stamps, tampered salary figures, and AI generation artifacts.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/image-verification"
                className="px-6 py-2.5 bg-primary text-primary-foreground text-xs md:text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                AI Image Detector →
              </Link>
              <Link
                href="/scan-interface"
                className="px-6 py-2.5 bg-muted border border-border text-foreground text-xs md:text-sm font-semibold rounded-xl hover:bg-muted/80 transition-colors"
              >
                Scan Full Offer Letter →
              </Link>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
