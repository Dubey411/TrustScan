import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';

export const metadata: Metadata = {
  title: 'Safety Guide | Fake Job Offer Check & CIN Verification Online',
  description: 'Learn how to perform a fake job offer check, ensure is this link safe, and do CIN verification online to protect yourself.',
  alternates: {
    canonical: '/safety-guide',
  },
  keywords: ['safety guide', 'fake job offer check', 'CIN verification online', 'is this link safe'],
};

export default function SafetyGuidePage() {
  const safetyTips = [
    {
      title: 'Fake Job Offer Check: Never Pay',
      description: 'Legitimate employers will never ask you to pay for "training", "laptop security deposit", or "processing fees". If they ask for money, it is a scam.',
      icon: 'CurrencyRupeeIcon',
    },
    {
      title: 'Check the Email Domain',
      description: 'Official recruiters use company domains (e.g., name@google.com). Be wary of recruiters using Gmail, Hotmail, or domains with slight typos (e.g., name@gooogle.com).',
      icon: 'EnvelopeIcon',
    },
    {
      title: 'Protect Your KYC Documents',
      description: 'Do not share your Aadhaar, PAN, or Bank details until you have verified the company is real. Scammers use these for identity theft.',
      icon: 'IdentificationIcon',
    },
    {
      title: 'CIN Verification Online & Official Portals',
      description: 'Check the Corporate Identity Number (CIN) or GST on the Ministry of Corporate Affairs (MCA) portal. Always perform CIN verification online before signing.',
      icon: 'BuildingOfficeIcon',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
                Student Safety Guide
              </h1>
              <p className="text-xl text-muted-foreground">
                Your manual for navigating the digital job market without falling into traps.
              </p>
            </div>

            {/* Tips Grid */}
            <div className="grid gap-8 mb-16">
              {safetyTips.map((tip, index) => (
                <div key={index} className="bg-card rounded-2xl p-8 border border-border shadow-subtle flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon name={tip.icon as any} size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-foreground mb-2">{tip.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Red Flags Section */}
            <div className="bg-error/5 border border-error/20 rounded-3xl p-8 md:p-12 mb-16">
              <h2 className="text-3xl font-headline font-bold text-error mb-6 flex items-center gap-3">
                <Icon name="ExclamationTriangleIcon" size={32} />
                Instant Red Flags
              </h2>
              <ul className="space-y-4">
                {[
                  'The interview is conducted ONLY over WhatsApp or Telegram.',
                  'You receive an offer letter without even applying or being interviewed.',
                  'The salary is too high for the required work (e.g., 50k for data entry).',
                  'The recruiter creates artificial urgency ("Join today or lose the spot").',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-foreground/80">
                    <span className="w-2 h-2 rounded-full bg-error mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="text-center bg-primary rounded-3xl p-12 text-primary-foreground">
              <h2 className="text-3xl font-headline font-bold mb-4">Need a Fake Job Offer Check?</h2>
              <p className="mb-8 opacity-90 text-lg">Use our scanner to verify documents and check <strong>is this link safe</strong> instantly.</p>
              <a href="/scan-interface" className="inline-block bg-white text-primary px-8 py-4 rounded-full font-bold hover:shadow-lg transition-transform active:scale-95">
                Scan Document Now
              </a>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
