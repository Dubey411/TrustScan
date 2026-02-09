import type { Metadata } from 'next';
import Header from '@/components/common/Header';
import PricingInteractive from './components/PricingInteractive';

export const metadata: Metadata = {
  title: 'Pricing & Plans | TrustScan AI - Free Job Fraud Protection',
  description: 'Proactive protection for students & job seekers. Start with our Free Plan for basic safety checks. Unlimited Deep Scans available for serious job hunters.',
  alternates: {
    canonical: '/pricing-page',
  },
  openGraph: {
    title: 'TrustScan AI Pricing - Free & Pro Plans',
    description: 'Protect your career from scams starting at ₹0. View our student-friendly pricing.',
    url: 'https://www.trustscanai.in/pricing-page',
  },
  keywords: ['scam protection pricing', 'fraud detection cost', 'job safety app india', 'free layout scanner'],
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <PricingInteractive />
    </>
  );
}