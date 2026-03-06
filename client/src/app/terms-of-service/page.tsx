import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | TrustScan AI',
  description: 'Read the terms and conditions for using TrustScan AI. Learn about proper use of our fraud detection tools and accuracy disclaimers.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="CalendarIcon" size={16} />
                Effective Date: January 24, 2026
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 space-y-10 shadow-subtle">
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using TrustScan AI, you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">2. Proper Use of Service</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                TrustScan is an educational and security tool. You agree NOT to:
              </p>
              <ul className="space-y-4">
                {[
                  'Use our tool to test and improve fraudulent documents you are creating.',
                  'Attempt to reverse engineer our proprietary rules engine or ML weights.',
                  'Automate scanning through bots or scripts without explicit API authorization.',
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start text-muted-foreground">
                    <Icon name="NoSymbolIcon" size={20} className="text-error mt-1 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
                <h2 className="text-2xl font-headline font-bold text-foreground mb-4">3. Accuracy of Analysis</h2>
                <p className="text-muted-foreground leading-relaxed">
                    While TrustScan uses advanced AI, no tool is 100% accurate. Our results are "Probability Estimates" and should be used as one part of your decision-making process. TrustScan is not liable for any losses resulting from decisions made based on our scan results.
                </p>
            </section>

             <div className="p-1 bg-gradient-to-r from-primary/50 to-primary rounded-2xl">
                <div className="bg-card p-8 rounded-[calc(1rem-1px)]">
                    <h3 className="text-xl font-headline font-bold text-foreground mb-2">Transparency Warning</h3>
                    <p className="text-muted-foreground text-sm">
                        Scammers evolve daily. Always use common sense alongside our technical verification. If it feels too good to be true, it probably is.
                    </p>
                </div>
             </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
