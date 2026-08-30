import type { Metadata } from 'next';
import HomepageInteractive from './homepage/components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'TrustScan AI | Fake Offer Letter Check Online & AI Fraud Detection',
  description: 'Free online tool to check fake offer letters, verify job offers, audit academic degrees, detect manipulated UPI screenshots, and verify MCA CIN companies with deep AI forensics.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'offer letter check online',
    'fake offer letter check online free',
    'fake offer letter detection',
    'fake offer letter detection pdf',
    'job offer letter check online free',
    'check offer letter online',
    'fake upi payment screenshot check',
    'ai image detection online',
    'degree marksheet verification',
    'company cin verification',
    'TrustScan AI'
  ],
};

export default function Home() {
  return <HomepageInteractive />;
}
