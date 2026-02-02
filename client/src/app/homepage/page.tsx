import type { Metadata } from 'next';
import HomepageInteractive from './components/HomepageInteractive';

export const metadata: Metadata = {
  title: 'TrustScan AI - Best Fraud Detection Tool in India',
  description: 'AI-powered security for India. Verify SMS Headers (RBI VSPE), check business CIN/GST (MCA21), and detect scam scripts instantly. Protecting students, freshers, and businesses from online fraud.',
};

export default function Homepage() {
  return <HomepageInteractive />;
}