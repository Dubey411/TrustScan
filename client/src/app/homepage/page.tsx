import type { Metadata } from 'next';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'TrustScan AI | India\'s #1 Job Scam & Link Fraud Detector',
  description: 'Instantly verify job offers, check suspicious links, and detect fake SMS headers. Trusted by Indian students for safe job searching. Try our Free AI Scanner now.',
  alternates: {
    canonical: '/homepage',
  },
  keywords: ['fake job checker India', 'link verifier', 'scam detector tool', 'SMS header search', 'verify company CIN', 'TrustScan'],
};

export default function Homepage() {
  return <HomepageInteractive />;
}