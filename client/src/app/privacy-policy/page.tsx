import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | TrustScan AI - Your Data Safety',
  description: 'Understand how TrustScan AI protects your data while performing fake job offer checks and link scans. We prioritize your privacy and minimize data retention.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground flex items-center gap-2">
                <Icon name="CalendarIcon" size={16} />
                Last updated: January 24, 2026
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 space-y-12 shadow-subtle">
            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">1. Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                At TrustScan AI, we understand that you trust us with sensitive information. Our primary mission is to protect you, and that starts with protecting your data. We design our systems to minimize data retention and maximize encryption.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-bold text-foreground mb-4">2. Data Processing Pipeline</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you upload a document for scanning:
              </p>
              <ul className="space-y-4">
                {[
                  'Processing: Documents are processed in-memory using our secure OCR pipeline.',
                  'Storage: We do NOT store full copies of your uploaded documents on our servers permanently unless you explicitly choose to save them to your User Dashboard.',
                  'Signals: We extract anonymized "signals" (e.g., presence of a specific scam keyword) to improve our detection AI.',
                ].map((text, i) => (
                  <li key={i} className="flex gap-4 items-start text-muted-foreground">
                    <Icon name="CheckCircleIcon" size={20} className="text-primary mt-1 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
                <h2 className="text-2xl font-headline font-bold text-foreground mb-4">3. Third-Party Sharing</h2>
                <p className="text-muted-foreground leading-relaxed">
                    We do not sell your personal information or document data to advertisers. We may share anonymized threat intelligence with security researchers to help stop larger fraudulent networks across India.
                </p>
            </section>

             <section className="bg-muted p-8 rounded-2xl border border-border/50">
              <h2 className="text-xl font-headline font-bold text-foreground mb-4">Contact Privacy Team</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Have questions about your data? Reach out to our dedicated privacy officer.
              </p>
              <a href="mailto:privacy@trustscan.ai" className="text-primary font-bold hover:underline">
                trustscan.ai@gmail.com
              </a>
            </section>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
