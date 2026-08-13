import type { Metadata } from 'next';
import HomepageInteractive from './homepage/components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'TrustScan AI | Universal Document, Government ID & Entity Verification',
  description: 'Instantly verify Government IDs (Aadhaar, PAN, DL), Company Registrations (GSTIN, CIN), Offer Letters, Certificates, and Invoices. India\'s trusted AI document verifier.',
  alternates: {
    canonical: '/',
  },
  keywords: ['document verification online', 'Aadhaar card verifier', 'PAN card check online', 'GSTIN verification', 'CIN checker India', 'offer letter verifier', 'invoice audit tool', 'fake document detector'],
};

export default function Home() {
  return <HomepageInteractive />;
}
