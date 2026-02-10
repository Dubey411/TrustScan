import type { Metadata } from 'next';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'TrustScan AI | Fake Job Offer Check & Link Safety Verifier',
  description: 'Instantly check fake job offers, verify if this link is safe, and detect UPI fraud messages. India\'s most trusted online fraudulent checker.',
  alternates: {
    canonical: '/homepage',
  },
  keywords: ['fake job offer check', 'is this link safe', 'UPI fraud message', 'CIN verification online', 'fake job checker India', 'link verifier', 'scam detector tool'],
};

export default function Homepage() {
  return <HomepageInteractive />;
}