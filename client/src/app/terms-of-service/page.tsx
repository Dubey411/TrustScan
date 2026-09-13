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

            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">4. User Accounts and Fair Usage</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account on TrustScan AI, you agree to provide accurate and complete registration information. You are responsible for safeguarding your login credentials and for any activities conducted under your account. TrustScan AI reserves the right to suspend or terminate accounts that violate these terms or abuse rate limits.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All software, algorithms, visual designs, brand assets, and content on TrustScan AI are the exclusive property of Shubham Dubey and TrustScan AI, protected by applicable copyright, trademark, and intellectual property laws. You may not duplicate, copy, or reuse any portion of the code or visual design elements without express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">6. Governing Law & Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of India, specifically under the Information Technology Act, 2000 and Digital Personal Data Protection Act, 2023 (DPDPA). Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Navi Mumbai / Mumbai, Maharashtra, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">7. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                If you have questions regarding these Terms of Service or need legal inquiries addressed, please reach out to us:
              </p>
              <div className="bg-muted/50 rounded-xl p-4 border border-border text-sm space-y-1 text-muted-foreground">
                <p><strong className="text-foreground">Entity:</strong> TrustScan AI (Founder: Shubham Dubey)</p>
                <p><strong className="text-foreground">Email:</strong> <a href="mailto:trustscan.ai@gmail.com" className="text-primary hover:underline">trustscan.ai@gmail.com</a></p>
                <p><strong className="text-foreground">Phone:</strong> +91 85916 94920</p>
                <p><strong className="text-foreground">Location:</strong> Navi Mumbai, Maharashtra, India</p>
              </div>
            </section>

            <div className="p-1 bg-gradient-to-r from-primary/50 to-primary rounded-2xl">
              <div className="bg-card p-8 rounded-[calc(1rem-1px)]">
                <h3 className="text-xl font-headline font-bold text-foreground mb-2">Transparency & Ethics Notice</h3>
                <p className="text-muted-foreground text-sm">
                  Scammers evolve daily. Always use common sense alongside our technical verification. If an offer or communication feels suspicious, independently verify the sender through government registries and certified company domains before taking financial or personal actions.
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
