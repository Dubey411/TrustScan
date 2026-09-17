import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import FooterSection from '../homepage/components/FooterSection';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Press & Media Resources | TrustScan AI',
  description: 'Official press releases, media kits, corporate fast facts, and press inquiry contacts for TrustScan AI India.',
  alternates: {
    canonical: '/press',
  },
};

export default function PressPage() {
  const fastFacts = [
    { label: 'Founded', value: 'January 2026' },
    { label: 'Headquarters', value: 'Navi Mumbai, Maharashtra, India' },
    { label: 'Founder & Lead AI Engineer', value: 'Shubham Dubey' },
    { label: 'Primary Mission', value: 'AI-Powered Digital Fraud & Credential Verification' },
    { label: 'Coverage', value: 'All Indian Corporate Entities, IT Offer Letters, UPI Receipts' },
  ];

  const pressReleases = [
    {
      date: 'September 2026',
      title: 'TrustScan AI Launches Multi-Modal Forensic Vision Suite to Combat Digital Document Tampering in India',
      summary: 'Engineered in Navi Mumbai, TrustScan AI introduces automated Error Level Analysis (ELA) and diffusion model noise inspection to detect counterfeit corporate seals, tampered UPI receipts, and fake appointment letters.',
    },
    {
      date: 'August 2026',
      title: 'TrustScan AI Crosses 10,000 Verified Scans Across Tier-1 and Tier-2 Indian Engineering Campuses',
      summary: 'Final-year engineering students across Maharashtra and Karnataka utilize TrustScan AI’s free sovereign verification tools to detect fake campus placement offers and spoof recruitment syndicates.',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-3">
              Media & Communications
            </span>
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-foreground mb-4">
              Press & Media Room
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Official press announcements, corporate background, brand assets, and direct contact details for journalists and researchers covering cybersecurity in India.
            </p>
          </div>

          {/* Fast Facts Grid */}
          <div className="bg-card border border-border rounded-3xl p-8 md:p-10 mb-16 shadow-subtle">
            <h2 className="text-2xl font-headline font-bold text-foreground mb-6">Corporate Fast Facts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fastFacts.map((fact, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                  <div className="text-xs font-mono text-muted-foreground uppercase">{fact.label}</div>
                  <div className="text-sm font-bold text-foreground">{fact.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Press Releases */}
          <div className="space-y-6 mb-16">
            <h2 className="text-2xl font-headline font-bold text-foreground">Official Announcements</h2>
            <div className="grid gap-6">
              {pressReleases.map((pr, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-3xl p-6 md:p-8 hover:border-primary/40 transition-colors shadow-subtle space-y-3"
                >
                  <div className="text-xs font-mono font-bold text-primary">{pr.date}</div>
                  <h3 className="text-xl font-headline font-bold text-foreground">{pr.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{pr.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Media Contact Card */}
          <div className="bg-muted/40 border border-border rounded-3xl p-8 md:p-10 text-center space-y-4 max-w-3xl mx-auto">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Icon name="EnvelopeIcon" size={26} />
            </div>
            <h3 className="text-2xl font-headline font-bold text-foreground">Media & Interview Inquiries</h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              For press inquiries, technical commentary on Indian cybercrime trends, or interview requests with our founder Shubham Dubey, contact our media desk directly:
            </p>
            <div className="pt-2">
              <a
                href="mailto:trustscan.ai@gmail.com?subject=Press / Media Inquiry"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-95 shadow-md transition-opacity"
              >
                Contact Press Desk: trustscan.ai@gmail.com
              </a>
            </div>
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
